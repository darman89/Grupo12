var express = require('express');
const async = require("async");
var router = express.Router();
var multer = require('multer');
var minio = require('minio');
var crypto = require('crypto');
var modelos = require("../models");
const moment = require('moment');
const estado_inicial_voz = 1;

var minioClient = new minio.Client({
    endPoint: `${process.env.MINIO_HOST}`,
    accessKey: `${process.env.MINIO_ACCESS_KEY}`,
    secretKey: `${process.env.MINIO_SECRET_KEY}`
});

function ensureAuth(req, res, next) {
    if (!req.userContext) {
        res.redirect('/login');
    }
    next();
}

function guardarImagen(url_minio, nombre, peso, extension, callback) {
    modelos.Imagen.create({
        url_minio: url_minio,
        nombre: nombre,
        peso: peso,
        extension: extension
    }).then(newImage => {
        callback(newImage);
    });
}

function guardarAudio(url_repo, nombre, peso, extension, callback) {
    modelos.ArchivoVoz.create({
        url_repo: url_repo,
        nombre: nombre,
        peso: peso,
        extension: extension
    }).then(newAudio => {
        callback(newAudio);
    });
}

function guardarVoz(id_voz_original, email, nombre_completo, observacion, callback) {
    modelos.Voz.create({
        id_voz_original: id_voz_original,
        email: email,
        nombre_completo: nombre_completo,
        fecha_upload: moment(),
        observacion: observacion,
        id_estado: estado_inicial_voz
    }).then(newVoice => {
        callback(newVoice)
    })
}

function guardarConcurso(id_usuario, nombre, id_banner, url, url_minio, fecha_inicio, fecha_final, valor, guion, recomendaciones, callback) {
    modelos.Concurso.create({
        id_usuario: id_usuario,
        nombre: nombre,
        id_banner: id_banner,
        url: url,
        url_minio: encodeURIComponent(url_minio),
        fecha_inicio: fecha_inicio,
        fecha_final: fecha_final,
        valor: valor,
        guion: guion,
        recomendaciones: recomendaciones
    }).then(newConcurso => {
        callback(newConcurso);
    });
}


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'SuperVoices', user: req.userContext});
});

/* GET home page. */
router.get('/dashboard', ensureAuth, function (req, res, next) {
    res.render('dashboard', {title: 'Concursos', user: req.userContext, dashboard: true});
});

router.get('/dashboard/crear', ensureAuth, function (req, res, next) {
    res.render('creacion', {layout: false});
});


router.get('/actualizar/:id', ensureAuth, function (req, res, next) {

    modelos.Concurso.findOne({
        where: {
            id: req.params.id,
            id_usuario: req.userContext.userinfo.sub,
        }
    }).then(concurso => {
        let concursoData = [];
        if (!concurso) {
            return res.status(400).json({error: 'No se ha encontrado el concurso en la base de datos!'})
        }else{
            concursoData.push({
                f0: concurso.nombre,
                f1: moment(concurso.fecha_inicio).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                f2: moment(concurso.fecha_final).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                f3: concurso.valor,
                f4: decodeURIComponent(concurso.url_minio),
                f5: concurso.url,
                f6: concurso.guion,
                f7: concurso.recomendaciones,
                f8: req.protocol + '://' + req.get('host') + '/actualizar/' + concurso.id
            });
            res.render('actualizacion', {layout: false, concurso: concursoData[0]});
        }
    });
});

router.put('/actualizar/:id', ensureAuth, function (req, res, next) {
    modelos.Concurso.findOne({
        where: {
            id: req.params.id,
            id_usuario: req.userContext.userinfo.sub,
        }
    }).then(concurso => {
        if (!concurso) {
            return res.status(400).json({ error: 'No se ha podido actualizar el evento!' })
        }else{
            concurso.update({
                id_usuario: req.userContext.userinfo.sub,
                nombre: req.body.nombre,
                url: req.body.url_evento,
                url_minio: encodeURIComponent(req.body.url_total),
                fecha_inicio: req.body.finicio,
                fecha_final: req.body.ffinal,
                valor: req.body.valor,
                guion: req.body.guion,
                recomendaciones: req.body.recomendaciones
            }).then(concurso => {
                return res.send({ message: 'El Concurso ha sido actualizado con éxito!' });
            });
        }

    });

});

router.post('/concurso/crear', ensureAuth, multer({storage: multer.memoryStorage()}).single("imagen"), function (req, res) {
    var ext = req.file.originalname.substring(req.file.originalname.lastIndexOf('.'));
    var nombre = crypto.randomBytes(20).toString('hex');

    minioClient.putObject(`${process.env.MINIO_BUCKET_IMAGE}`, nombre + ext, req.file.buffer, function (error, etag) {
        if (error) {
            return console.log(error);
        }
        guardarImagen(nombre + ext, req.file.originalname, req.file.size, ext, function (record) {
            if (record.id > 0) {
                guardarConcurso(
                    req.userContext.userinfo.sub,
                    req.body.nombre,
                    record.id, req.body.url_evento,
                    req.body.url_total,
                    req.body.finicio,
                    req.body.ffinal,
                    req.body.valor,
                    req.body.guion,
                    req.body.recomendaciones,
                    function (concurso) {
                        if (concurso.id > 0) {
                            return res.send({message: 'El concurso ha sido creado!'});
                        }
                        return res.status(400).json({error: 'No se ha podido crear el concurso!'})
                    });
            } else {
                return res.status(400).json({error: 'No se ha podido crear el concurso!'})
            }
        });

    });
});

// Datatable Home
router.get("/concursos", (req, res) => {
    modelos.Concurso.findAll({
        order: [['id', 'DESC']],
        attributes: ['id', 'nombre', 'fecha_inicio', 'fecha_final', 'valor', 'url_minio'],
    }).then(concursos => {
        let concursoData = [];
        async.eachSeries(concursos, (concurso, callback) => {
            concurso = concurso.get({plain: true});
            concursoData.push({
                f0: concurso.nombre,
                f1: moment(concurso.fecha_inicio).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                f2: moment(concurso.fecha_final).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                f3: concurso.valor,
                f4: decodeURIComponent(concurso.url_minio),
            });
            callback();
        }, err => {
            if (!err)
                return res.send(concursoData);
        });
    });
});

// Datatable dashboard
router.get("/concurso/list", ensureAuth, (req, res) => {
    modelos.Concurso.findAll({
        order: [['id', 'DESC']],
        attributes: ['id', 'nombre', 'fecha_inicio', 'fecha_final', 'valor', 'url_minio'],
        where: {
            id_usuario: req.userContext.userinfo.sub,
        }
    }).then(concursos => {
        let concursoData = [];
        async.eachSeries(concursos, (concurso, callback) => {
            concurso = concurso.get({plain: true});
            concursoData.push({
                f0: concurso.nombre,
                f1: moment(concurso.fecha_inicio).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                f2: moment(concurso.fecha_final).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                f3: concurso.valor,
                f4: decodeURIComponent(concurso.url_minio),
                f5: req.protocol + '://' + req.get('host') + '/concurso/' + concurso.id,
                f6: req.protocol + '://' + req.get('host') + '/actualizar/' + concurso.id
            });
            callback();
        }, err => {
            if (!err)
                return res.send(concursoData);
        });
    });
});

// Cargar Vista de eliminación de Concursos
router.get("/concurso/eliminar", ensureAuth, (req, res) => {
    return res.render("eliminar", {layout: false});
});

// Eliminar Concurso
router.delete("/concurso/:id", ensureAuth, (req, res) => {
    //return res.send(req.params.id);
    modelos.Concurso.findOne({
        where: {
            id: req.params.id,
            id_usuario: req.userContext.userinfo.sub,
        },
        include: ['imagen']
    }).then(concurso => {

        if (!concurso) {
            return res.status(400).json({error: 'No se ha encontrado el concurso en la base de datos!'})
        }

        concurso.destroy().then(rowDeleted => {
            minioClient.removeObject(`${process.env.MINIO_BUCKET_IMAGE}`, concurso.imagen.url_minio, function (err) {
                if (err) {
                    return res.status(400).json({error: 'No se ha podido eliminar el concurso. Ya existen voces cargadas!'})
                } else {
                    return res.send({message: 'El concurso ha sido eliminado!'});
                }
            })

        }, function (err) {
            if (err)
                return res.status(400).json({error: 'No se ha podido eliminar el concurso. Ya existen voces cargadas!'})
        });


    });
});

// Cargar Vista de Concurso
router.get("/concursos/:slug", (req, res) => {


    modelos.Concurso.findOne({
        attributes: ['id', 'id_usuario', 'nombre', 'fecha_inicio', 'fecha_final', 'valor', 'guion', 'recomendaciones'],
        where: {
            url_minio: encodeURIComponent(req.protocol + '://' + req.get('host') + '/concursos/' + req.params.slug),
        },
        include: ['imagen']
    }).then(concurso => {

        if (!concurso) {
            return res.json({error: 'No se ha encontrado el concurso en la base de datos!'})
        }

        minioClient.presignedUrl('GET', `${process.env.MINIO_BUCKET_IMAGE}`, concurso.imagen.url_minio, 60 * 60, function (err, presignedUrl) {
            if (err) return console.log(err);
            let $user_null = typeof req.userContext === 'undefined';
            res.render('profile', {
                dashboard: true,
                referer: $user_null ? req.protocol + '://' + req.get('host') + '/voces/list/' + concurso.id : req.protocol + '://' + req.get('host') + '/adm/voces/list/' + concurso.id,
                uri: req.protocol + '://' + req.get('host') + '/concurso/audio/' + concurso.id,
                concurso: concurso,
                back: presignedUrl,
                title: 'Concurso - ' + concurso.nombre,
                layout: 'concurso',
                fecha_inicio: moment(concurso.fecha_inicio).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                fecha_final: moment(concurso.fecha_final).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                user: req.userContext,
                admin: !$user_null && req.userContext.userinfo.sub === concurso.id_usuario ? true : false
            });
        });
    });

});

// Cargar Vista para adjuntar audio
router.get("/concurso/audio/:id_concurso", (req, res) => {
    return res.render("cargaaudio", {layout: false});
});

// Guardar Audio
router.post('/concurso/audio/:id_concurso', multer({storage: multer.memoryStorage()}).single("audio"), function (req, res) {
    var ext = req.file.originalname.substring(req.file.originalname.lastIndexOf('.'));
    var nombre = crypto.randomBytes(20).toString('hex');


    minioClient.putObject(`${process.env.MINIO_BUCKET_AUDIO_ORIGINAL}`, nombre + ext, req.file.buffer, function (error, etag) {
        if (error) {
            return console.log(error);
        }

        guardarAudio(nombre + ext, req.file.originalname, req.file.size, ext, function (record) {
            if (record.id > 0) {
                guardarVoz(record.id, req.body.email, req.body.nombre, req.body.observacion, function (voz) {
                    if (voz.id > 0) {
                        modelos.Concurso.findOne({
                            where: {
                                id: req.params.id_concurso,
                            },
                            include: ['imagen']
                        }).then(concurso => {
                            modelos.ConcursoVoces.create({
                                id_concurso: concurso.id,
                                id_voz: voz.id
                            }).then(newConcursoVoces => {
                                if (newConcursoVoces) {
                                    var audioQueue = req.app.get('audioQueue');
                                    audioQueue.add({audio: nombre + ext, voz: voz.id, email: voz.email, usuario: voz.nombre_completo, concurso: concurso.nombre, url_minio: decodeURIComponent(concurso.url_minio)});
                                    return res.status(200).json({message: "Hemos recibido tu voz y la estamos procesando para que sea publicada en la página del concurso y pueda ser posteriormente revisada por nuestro equipo de trabajo. Tan pronto la voz quede publicada en la página del concurso te notificaremos por email"});
                                } else {
                                    return res.status(400).json({error: 'No se ha podido subir la voz!'})
                                }
                            });

                        });
                    } else {
                        return res.status(400).json({error: 'No se ha podido subir la voz!'})
                    }
                });
            } else {
                return res.status(400).json({error: 'No se ha podido subir la voz!'})
            }
        });
    });

});

// Datatable con voces subidas
router.get("/voces/list/:id_concurso", (req, res) => {
    modelos.ConcursoVoces.findAll({
        order: [['id_voz', 'DESC']],
        attributes: ['id_voz'],
        where: {
            id_concurso: req.params.id_concurso,
        },
        raw: true
    }).then(voces => {
        if (!voces) {
            return res.json([])
        } else {
            const getVozbyId = voz => {
                return modelos.Voz.findOne({
                    order: [['id', 'DESC']],
                    attributes: ['fecha_upload', 'nombre_completo', 'email', 'id_voz_convertida'],
                    where: {
                        id: voz,
                        id_estado: 2
                    },
                    raw: true
                }).then(audio => {
                    if (audio) {
                        return audio;
                    }
                });
            };
            let vocesData = [];

            voces.forEach(function (voz) {
                let promise = getVozbyId(voz.id_voz);
                vocesData.push(promise)
            });

            Promise.all(vocesData).then(function (result) {
                var response = [];
                result.forEach(function (voz) {
                    if (typeof voz !== 'undefined') {
                        response.push({
                            f0: moment(voz.fecha_upload).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                            f1: voz.nombre_completo,
                            f2: voz.email,
                            f3: req.protocol + '://' + req.get('host') + '/voz/audio/' + voz.id_voz_convertida
                        });
                    }
                });
                return res.send(response);
            })
        }
    })

});

// Cargar Audio
router.get("/voz/audio/:id", (req, res) => {
    if(req.params.id !== 'null'){
        modelos.ArchivoVoz.findOne({
            attributes: ['url_repo'],
            where: {
                id: req.params.id
            }
        }).then(audio => {
            if (!audio) {
                return res.json({error: 'No se ha encontrado el audio en la base de datos!'})
            } else {
                minioClient.presignedUrl('GET', `${process.env.MINIO_BUCKET_AUDIO_CONVERTIDO}`, audio.url_repo, 60 * 60, function (err, presignedUrl) {
                    if (err) return console.log(err)
                    res.render('player', {layout: false, url: presignedUrl});
                })

            }
        });
    }else{
        res.render('player_none', {layout: false});
    }
});

// Datatable con voces subidas (administrativo)
router.get("/adm/voces/list/:id_concurso", ensureAuth, (req, res) => {
    modelos.ConcursoVoces.findAll({
        order: [['id_voz', 'DESC']],
        attributes: ['id_voz'],
        where: {
            id_concurso: req.params.id_concurso,
        },
        raw: true
    }).then(voces => {
        if (!voces) {
            return res.json([])
        } else {
            const getVozbyId = voz => {
                return modelos.Voz.findOne({
                    order: [['id', 'DESC']],
                    attributes: ['fecha_upload', 'nombre_completo', 'email', 'id_voz_convertida', 'id_voz_original'],
                    where: {
                        id: voz
                    },
                    include: ['estado'],
                    raw: true
                }).then(audio => {
                    if (audio) {
                        return audio;
                    }
                });
            };
            let vocesData = [];

            voces.forEach(function (voz) {
                let promise = getVozbyId(voz.id_voz);
                vocesData.push(promise)
            });

            Promise.all(vocesData).then(function (result) {
                var response = [];
                result.forEach(function (voz) {
                    if (typeof voz !== 'undefined') {
                        response.push({
                            f0: moment(voz.fecha_upload).utcOffset('-0500').format('DD/MM/YYYY hh:mm A'),
                            f1: voz.nombre_completo,
                            f2: voz.email,
                            f3: voz['estado.descripcion'],
                            f4: req.protocol + '://' + req.get('host') + '/voz/audio/' + voz.id_voz_convertida,
                            f5: req.protocol + '://' + req.get('host') + '/archivo/audio/' + voz.id_voz_original
                        });
                    }
                });
                return res.send(response);
            })
        }
    })

});

// Cargar Audio
router.get("/archivo/audio/:id", (req, res) => {
    modelos.ArchivoVoz.findOne({
        attributes: ['url_repo','nombre'],
        where: {
            id: req.params.id
        }
    }).then(audio => {
        if (!audio) {
            return res.json({error: 'No se ha encontrado el audio en la base de datos!'})
        } else {
            minioClient.getObject(`${process.env.MINIO_BUCKET_AUDIO_ORIGINAL}`, audio.url_repo, function(err, stream) {
                if(err){
                    return res.status(400).json({ msg: 'No encontrado!' })
                }else{
                    res.attachment(audio.nombre);
                    stream.pipe(res, {end: true});
                }
            });
        }
    });

});


module.exports = router;
