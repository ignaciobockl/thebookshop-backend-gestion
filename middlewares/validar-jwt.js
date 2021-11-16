const { response } = require('express');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario.model');


const validarJWT = async(req, res = response, next) => {

    // Leer el Token
    const token = req.header('x-token');
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    // Verificar el toke
    try {

        const { uid } = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const usuarioNom = await Usuario.findById(uid);

        req.uid = uid;
        req.nombre = usuarioNom.nombre;


        // Leer  el usuario que corresponde al uid
        const usuario = await Usuario.findById(uid);
        if (!usuario) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existente en DB'
            });
        }

        // Verificar si el uid tiene estado true
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Token no válido - usuario con estado: false (eliminado)'
            });
        }

        req.usuario = usuario;

        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Token no valido'
        });
    }

}


module.exports = {
    validarJWT
}