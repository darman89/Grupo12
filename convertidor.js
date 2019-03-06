module.exports = {
    process: function (job) {
        var ffmpeg = require('fluent-ffmpeg');
        var minio = require('minio');
        var fs = require('fs');
        var crypto = require('crypto');
        var modelos = require("./models");
        var Mailgun = require('mailgun-js');

        var temp_file = crypto.randomBytes(20).toString('hex');
        var path = '/tmp/'
        var outStream = fs.createWriteStream(path + temp_file);

        var mailgun = new Mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});


        var minioClient = new minio.Client({
            endPoint: `${process.env.MINIO_HOST}`,
            port: Number(process.env.MINIO_PORT),
            useSSL: false,
            accessKey: `${process.env.MINIO_ACCESS_KEY}`,
            secretKey: `${process.env.MINIO_SECRET_KEY}`
        });

        minioClient.fGetObject(`${process.env.MINIO_BUCKET_AUDIO_ORIGINAL}`, job.data.audio, path + job.data.audio, function (err) {
            if (err) {
                return console.log(err)
            }

            ffmpeg(path + job.data.audio)
                .toFormat('mp3')
                .on('end', function (err) {
                    if (err) {
                        return console.log(err)
                    }

                    outStream.destroy();
                    fs.unlink(path + job.data.audio, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    });

                    var inStream = fs.createReadStream(path + temp_file);
                    minioClient.putObject(`${process.env.MINIO_BUCKET_AUDIO_CONVERTIDO}`, temp_file + '.mp3', inStream, function (err, etag) {
                        inStream.destroy();

                        const stats = fs.statSync(path + temp_file)
                        const fileSizeInBytes = stats.size

                        fs.unlink(path + temp_file, (err) => {
                            if (err) {
                                console.error(err)
                            }

                            modelos.ArchivoVoz.create({
                                url_repo: temp_file + '.mp3',
                                nombre: temp_file + '.mp3',
                                peso: fileSizeInBytes,
                                extension: '.mp3'
                            }).then(newAudio => {
                                modelos.Voz.findOne({
                                    where: {
                                        id: job.data.voz,
                                    }
                                }).then(newVoice => {
                                    if (!newVoice) {
                                        return console.log('error, no existe el registro de la voz')
                                    } else {

                                        newVoice.update({
                                            id_voz_convertida: newAudio.id,
                                            id_estado: 2
                                        }).then(() => {
                                            var data = {
                                                //Specify email data
                                                from: 'supervoices@mgsend.net',
                                                //The email to contact
                                                to: job.data.email,
                                                //Subject and text data
                                                subject: 'Hola desde Supervoices',
                                                html: 'Hola!, tu voz ya está disponible en el concurso  <a href="'+job.data.url_minio+'"><strong>'+job.data.concurso+'</strong></a>'
                                            };

                                            mailgun.messages().send(data, function (err, body) {
                                                //If there is an error, render the error page
                                                if (err) {
                                                    console.log("got an error: ", err);
                                                }
                                                //Else we can greet    and leave
                                                else {
                                                    //Here "submitted.jade" is the view file for this landing page
                                                    //We pass the variable "email" from the url parameter in an object rendered by Jade
                                                    return console.log('Proceso Finalizado');
                                                }
                                            });

                                        });
                                    }
                                })

                            });


                        });
                        return console.log(err, etag)
                    });


                })
                .on('error', function (err) {
                    console.log('an error happened: ' + err.message);
                })
                .on('progress', function (progress) {
                    job.progress(progress);
                    console.log('Processing: ' + progress.percent.toFixed(2) + '%');

                })
                .writeToStream(outStream, {end: true})

        });

    }
}

