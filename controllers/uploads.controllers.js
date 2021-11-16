const path = require('path');
const fs = require('fs');

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const { response } = require("express");
const { subirArchivo } = require("../helpers");


const Usuario = require('../models/usuario.model');
const Producto = require('../models/producto.model');
const Evento = require('../models/evento.model');


const cargarArchivo = async(req, res = response) => {

    // let sampleFile;
    // let uploadPath;

    // if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
    //     res.status(400).json({msg:'No archivos para subir en la petición.'});
    //     return;
    // }

    try {

        // Imagenes
        // const nombre = await subirArchivo( req.files, ['txt','md'], 'textos' );
        const nombre = await subirArchivo(req.files, undefined, 'imgs');
        res.json({ nombre });

    } catch (error) {
        res.status(400).json({ msg });
    }

}


const actualizarArchivo = async(req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id: ${ id }`
                });
            }

            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id: ${ id }`
                });
            }

            break;

        default:
            return res.status(400).json({
                ok: false,
                msg: 'No ingreso una coleccion valida - /usuarios /productos'
            })
    }

    // Limpiar imagenes previas
    if (modelo.img) {

        // Hay que borrar la imagen del servidor
        const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.img);
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);
        }

    }

    modelo.img = await subirArchivo(req.files, undefined, coleccion);
    await modelo.save();

    res.json(modelo);

}

const mostrarImagen = async(req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id: ${ id }`
                });
            }

            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id: ${ id }`
                });
            }

            break;

        default:
            return res.status(400).json({
                ok: false,
                msg: 'No ingreso una coleccion valida - /usuarios /productos'
            })
    }

    // Limpiar imagenes previas
    if (modelo.img) {

        // Hay que borrar la imagen del servidor
        const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.img);
        if (fs.existsSync(pathImagen)) {
            return res.sendFile(pathImagen);
        }

    }

    const pathImagen = path.join(__dirname, '../assets/no-image.jpg');
    res.sendFile(pathImagen);

}


const actualizarImagenCloudinary = async(req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id: ${ id }`
                });
            }

            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id: ${ id }`
                });
            }

            break;

        case 'eventos':
            modelo = await Evento.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un evento con el id: ${ id }`
                });
            }

            break;

        default:
            return res.status(400).json({
                ok: false,
                msg: 'No ingreso una coleccion valida - /usuarios /productos /eventos'
            })
    }


    if (modelo.img) {

        // Hay que borrar la imagen del servidor
        const nombreArr = modelo.img.split('/');
        console.log(nombreArr);
        const nombre = nombreArr[7];
        console.log(nombre);
        const [public_id] = nombre.split('.');
        console.log(public_id);
        cloudinary.uploader.destroy(public_id)

    }

    const { tempFilePath } = req.files.archivo;
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

    modelo.img = secure_url;

    await modelo.save();

    res.json(modelo);

}


const mostrarImagenCloudinary = async(req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id: ${ id }`
                });
            }

            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id: ${ id }`
                });
            }

            break;

        default:
            return res.status(400).json({
                ok: false,
                msg: 'No ingreso una coleccion valida - /usuarios /productos'
            })
    }

    // Limpiar imagenes previas
    if (modelo.img) {

        // Hay que borrar la imagen del servidor
        const pathImagen = modelo.img;
        console.log(pathImagen)
            // if ( fs.existsSync( pathImagen ) ) {
            //     return res.sendFile( pathImagen );
            // }
        return res.sendFile(pathImagen);

    }

    // const pathImagen = path.join( __dirname, '../assets/no-image.jpg' );
    res.sendFile(pathImagen);

}



module.exports = {
    actualizarArchivo,
    actualizarImagenCloudinary,
    cargarArchivo,
    mostrarImagen,
    mostrarImagenCloudinary
}