const { response } = require("express");
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const { generarJWT } = require("../helpers/jwt");
const { googleVerify } = require("../helpers/google-verify");



const login = async( req, res = response ) => {

    const { email, password } = req.body;

    try {

        const usuario = await Usuario.findOne({ email });

        // Si es usuario de google y no tiene la contraseña encriptada, encriptarla
        if ( usuario.google ) {
            
            if ( usuario.password === 'abc123456' ) {
                
                // Encriptar la contraseña
                const salt = bcrypt.genSaltSync();
                usuario.password = bcrypt.hashSync(password, salt);
                
                await usuario.save();
            }

        }
        
        // Verificar si el email existe
        if (!usuario) {
            return res.status(400).json({
                msg: 'USUARIO / Password no son correctos - error email'
            });
        }

        // Verificar si el usuario esta activo
        if (!usuario.estado) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - estado: false'
            });
        }

        // Verificar la contraseña
        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'Usuario / PASSWORD no son correctos - password'
            });
        }

        // Generar JWT
        const token = await generarJWT(usuario.id);

        res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'El email con el que intenta ingresar no se encuentra registrado.'
        });
    }

}

const googleSignIn = async(req, res = response) => {

    const { id_token } = req.body;

    try {

        const { email, nombre, img } = await googleVerify(id_token);

        let usuario = await Usuario.findOne({ email });

        if (!usuario) {
            //Tengo que crearlo
            const data = {
                nombre,
                email,
                password: 'abc123456',
                img,
                google: true
            };

            // Encriptar la contraseña
            // const salt = bcrypt.genSaltSync();
            // usuario.password = bcrypt.hashSync(password, salt);

            usuario = new Usuario(data);
            await usuario.save();

        }

        // Si el usuario en DB esta bloqueado
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        // Generar JWT
        const token = await generarJWT(usuario.id);

        res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'El token de Google SignIn no se pudo verificar'
        });
    }

}

const revalidarToken = async(req, res = response) => {

    const { uid, nombre } = req;

    // Generar JWT
    const token = await generarJWT( uid, nombre );

    return res.json({
        ok: true,
        msg:'Token renovado',
        uid,
        nombre,
        token
    });

}



module.exports = {
    login,
    googleSignIn,
    revalidarToken
}