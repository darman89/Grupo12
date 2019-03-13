module.exports = {
    process: function (job) {
        let ffmpeg = require('fluent-ffmpeg');
        let nodemailer = require('nodemailer');
        let aws = require('aws-sdk');
        let minio = require('minio');
        let fs = require('fs');
        let crypto = require('crypto');
        let modelos = require("./models");
        let temp_file = crypto.randomBytes(20).toString('hex');
        let path = process.env.TEMP_PATH;
        let outStream = fs.createWriteStream(path + temp_file);

        aws.config.loadFromPath('config.json');

        function callback(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        }

        let minioClient = new minio.Client({
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
                                            var mailOptions = {
                                                from: 'Supervoices <'+process.env.MAIL_FROM+'>',
                                                to: job.data.email,
                                                subject: 'Hola desde Supervoices',
                                                text: 'Hola '+job.data.usuario+'!, tu voz ya está disponible en el concurso  <<'+job.data.url_minio+'">>. Por favor copia y pega este link en el navegador: '+job.data.concurso,
                                                html: 'Hola '+job.data.usuario+'!, tu voz ya está disponible en el concurso  <a href="'+job.data.url_minio+'"><strong>'+job.data.concurso+'</strong></a>',
                                            };

                                            // Send e-mail using AWS SES
                                            mailOptions.subject = 'Hola desde Supervoices';
                                            var sesTransporter = nodemailer.createTransport({
                                                SES: new aws.SES({
                                                    apiVersion: 'latest'
                                                })
                                            });
                                            sesTransporter.sendMail(mailOptions, callback);
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
};

