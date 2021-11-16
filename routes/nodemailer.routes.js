/**
 * Ruta /api/nodemailers
 */

const { Router, response } = require('express');
const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');

const router = Router();

router.post('/enviar-codigo', async(req, res = response) => {

    const { destinatario } = req.body;

    if (!destinatario) {
        return res.status(400).json({
            ok: false,
            msg: 'El email del destinatario es obligatorio'
        });
    }

    const usuario = await Usuario.findOne({ email: destinatario });
    if (!usuario) {
        return res.status(404).json({
            ok: false,
            msg: 'No existe email o no esta registrado'
        });
    }

    // Generador de Codigo 6 digitos
    const makeid = async(length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    let cod = await makeid(6);

    const data = {
        codigo: cod,
    }
    await Usuario.findByIdAndUpdate(usuario._id, data);

    // Data Pagina
    const dataPagina = {
        nombre: 'THE BOOK SHOP',
        email: 'thebookshoplibrary21@gmail.com',
        numero: 5493814957178
    }

    // Data Persona
    const dataPersona = {
        nombre: usuario.nombre,
    }

    // HTML
    const htmlTemplate = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="telephone=no" name="format-detection">
        <title></title>
        <!--[if (mso 16)]>
        <style type="text/css">
        a {text-decoration: none;}
        </style>
        <![endif]-->
        <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
        <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG></o:AllowPNG>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    </head>
    
    <body>
        <div class="es-wrapper-color">
            <!--[if gte mso 9]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                    <v:fill type="tile" color="#fafafa"></v:fill>
                </v:background>
            <![endif]-->
            <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0">
                <tbody>
                    <tr>
                        <td class="esd-email-paddings" valign="top">
                            <table class="es-content esd-footer-popover" cellspacing="0" cellpadding="0" align="center">
                                <tbody>
                                    <tr>
                                        <td class="esd-stripe" style="background-color: #fafafa;" bgcolor="#fafafa" align="center">
                                            <table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
                                                <tbody>
                                                    <tr>
                                                        <td class="esd-structure es-p40t es-p20r es-p20l" style="background-color: transparent; background-position: left top;" bgcolor="transparent" align="left">
                                                            <table width="100%" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                            <table style="background-position: left top;" width="100%" cellspacing="0" cellpadding="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td class="esd-block-text es-p25t es-p40r es-p40l" align="center">
                                                                                            <p style="font-size: 20px;"><strong><span style="font-size:26px;">  ${ dataPagina.nombre } </span><br></strong></p>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td class="esd-block-image es-p5t es-p5b" align="center" style="font-size:0"><a target="_blank"><img src="https://tlr.stripocdn.email/content/guids/CABINET_dd354a98a803b60e2f0411e893c82f56/images/23891556799905703.png" alt style="display: block;" width="175"></a></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td class="esd-block-text es-p15t es-p15b" align="center">
                                                                                            <h1 style="color: #333333; font-size: 20px;"><strong style="background-color: transparent;">¿OLVIDASTE LA CONTRASEÑA?</strong></h1>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td class="esd-block-text es-p40r es-p40l" align="center">
                                                                                            <p style="font-size: 19px;">Hola, ${ dataPersona.nombre }</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td class="esd-block-text es-p35r es-p40l" align="center">
                                                                                            <p style="font-size: 19px;">¡Hubo una solicitud para cambiar su contraseña!</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td class="esd-block-text es-p25t es-p40r es-p40l" align="center">
                                                                                            <p style="font-size: 19px;">Si no realizó esta solicitud, simplemente ignore este correo electrónico. De lo contrario, le brindamos el código para resetearla:</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td class="esd-block-text es-p25t es-p40r es-p40l" align="center">
                                                                                            <p style="font-size: 26px;"> ${ data.codigo } <br><br></p>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="esd-structure es-p5t es-p20b es-p20r es-p20l" style="background-position: left top;" align="left">
                                                            <table width="100%" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="esd-container-frame" width="560" valign="top" align="center">
                                                                            <table width="100%" cellspacing="0" cellpadding="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td class="esd-block-text" esd-links-color="#666666" align="center">
                                                                                            <p style="font-size: 14px;">Contacto: <a target="_blank" style="font-size: 14px; color: #666666;" href="tel:123456789">+</a> ${ dataPagina.numero } | <a target="_blank" href="mailto:your@mail.com" style="font-size: 14px; color: #666666;"> ${ dataPagina.email } </a></p>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    
    </html>
    `;


    // Email
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: 'thebookshoplibrary21@gmail.com',
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        }
    });

    let mailOptions = {
        from: 'The Book Shop<thebookshoplibrary21@gmail.com>',
        to: destinatario,
        subject: 'Restablecer Contraseña',
        html: htmlTemplate
    }

    transporter.sendMail(mailOptions, function(err, resp) {
        if (err) {
            console.log(err);
            return res.status(400).json({
                ok: false,
                err
            })
        } else {
            console.log('Email Send...');
            return res.json({
                ok: true,
                msg: 'Email Send...',
                codigo: cod,
                resp
            })
        }
    })

});

router.post('/aplicar-codigo', async(req, res = response) => {

    const { codigo, email } = req.body;

    if (!codigo) {
        return res.status(400).json({
            ok: false,
            msg: 'El código es obligatorio'
        });
    }

    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: 'El email del usuario es obligatorio'
        });
    }

    const usuario = await Usuario.findOne({ email: email });
    if (!usuario) {
        return res.status({
            ok: false,
            msg: 'El usuario no existe o no esta registrado'
        });
    }

    console.log(`codigo: ${codigo}`)
    console.log(`codigo usuario: ${usuario.codigo}`)
    if (usuario.codigo.toString() === codigo.toString()) {
        console.log('codigos iguales');
        return res.json({
            ok: true,
            msg: 'Codigo ok'
        })
    } else {
        return res.status(400).json({
            ok: false,
            msg: 'Código incorrecto'
        });
    }

});

router.post('/restablecer', async(req, res = response) => {

    let { email, password } = req.body;


    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: 'El email es obligatorio'
        });
    }

    if (!password) {
        return res.status(400).json({
            ok: false,
            msg: 'La contraseña es obligatoria'
        });
    }

    const usuario = await Usuario.findOne({ email: email });
    if (!usuario) {
        return res.status({
            ok: false,
            msg: 'El usuario no existe o no esta registrado'
        });
    }

    // Encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    password = bcrypt.hashSync(password, salt);

    const data = {
        password: password,
    }


    const restablecer = await Usuario.findByIdAndUpdate(usuario._id, data, { new: true });
    if (!restablecer) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al restablecer la contraseña'
        });
    } else {
        return res.json({
            ok: true,
            msg: 'La contraseña fue restablecida correctamente',
            restablecer
        });
    }

});



module.exports = router;