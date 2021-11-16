const { response } = require('express');
const bcrypt = require('bcryptjs');

const Producto = require('../models/producto.model');
const Editorial = require('../models/editorial.model');
const Autor = require('../models/autor.model');
const SubCategoria = require('../models/subCategoria.model');
const Usuario = require('../models/usuario.model');

const { isValidObjectId } = require('mongoose');
// const { actualizarEditorial } = require('./editoriales.controllers');



const obtenerProductos = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, productos] = await Promise.all([
        Producto.count(estadoBorrado),
        Producto.find(estadoBorrado)
        .populate('editorial', 'nombre')
        .populate('autor', 'nombre')
        .populate('usuario', 'nombre')
        .populate({
            path: 'subCategoria',
            select: 'nombre',
            populate: {
                path: 'categoria',
                select: 'nombre'
            }
        })
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json(productos);
    // res.json({
    //     total,
    //     productos
    // });

}

const obtenerProductoPorId = async(req, res = response) => {

    const { id } = req.params;
    const producto = await Producto.findById(id)
        .populate('editorial', 'nombre')
        .populate('autor', 'nombre')
        .populate('usuario', 'nombre')
        .populate({
            path: 'subCategoria',
            select: 'nombre',
            populate: {
                path: 'categoria',
                select: 'nombre'
            }
        });
    
    if ( producto.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `El producto: ${producto.titulo} esta eliminado`
        });
    }

    res.json(producto);

}

const crearProducto = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    // const productoDB = await Producto.findOne({ titulo: body.titulo });
    // if (productoDB) {
    //     return res.status(400).json({
    //         msg: `El producto ${ productoDB.titulo }, ya existe`
    //     });
    // }

    // Asignar foto por defecto al producto
    if (!body.img || body.img === null || body.img === undefined) {

        const user = await Usuario.findOne({ email: 'admin@admin.com' })
        body.img = user.img;

    }

    // Generar la data a guardar 
    const data = {
        ...body,
        titulo: body.titulo.toUpperCase(),
        usuario: req.usuario._id
    }

    const producto = new Producto(data);

    //Guardar DB
    await producto.save();

    res.status(201).json({
        ok: true,
        producto
    });

}

const actualizarProducto = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si el producto no esta eliminado
    const eliminado = await Producto.findById(id);
    if (eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'El Producto que trata de modificar esta eliminado'
        });
    }

    if (data.titulo) {

        // Verificar si el nombre del producto existe en la db
        const productoDB = await Producto.findOne({ titulo: data.titulo.toUpperCase() });
        console.log('object')

        if (productoDB) {

            console.log(`Id: ${id}`);
            console.log(`productoDB._id: ${productoDB._id}`);

            if (id.toString() === productoDB._id.toString()) {
                console.log('los id son iguales, acepta el titulo');
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `El Producto ${ productoDB.titulo }, ya existe, ingrese otro`
                });
            }

        }

        data.titulo = data.titulo.toUpperCase();

    }

    if (data.titulo === '') {
        return res.status(400).json({
            ok: false,
            msg: 'El titulo es obligatorio'
        });
    }

    // Verificar si se cambio la editorial y validarla
    try {

        const editorialDBE = await Editorial.findById(data.editorial);

        if (editorialDBE !== null) {

            if (isValidObjectId(editorialDBE)) {
                data.editorial = editorialDBE._id;
            }

        }

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'No es un id de Mongo válido - editorial'
        });
    }

    // Verificar si se cambio el autor y validarlo
    try {

        const AutorDBA = await Autor.findById(data.autor);
        console.log(AutorDBA)
        if (AutorDBA !== null) {

            if (isValidObjectId(AutorDBA)) {
                data.autor = AutorDBA._id;
            }

        }

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'No es un id de Mongo válido - autor'
        });
    }

    // Verificar si se cambio la subCategoria y validarlo
    try {

        const subCategoriaDB = await SubCategoria.findById(data.subCategoria);
        console.log(subCategoriaDB)
        if (subCategoriaDB !== null) {

            if (isValidObjectId(subCategoriaDB)) {
                data.subCategoria = subCategoriaDB._id;
            }

        }

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'No es un id de Mongo válido - subCategoria'
        });
    }


    data.usuario = req.usuario._id;

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true })
        .populate('autor', 'nombre')
        .populate('editorial', 'nombre')
        .populate('usuario', 'nombre')
        .populate({
            path: 'subCategoria',
            select: 'nombre',
            populate: {
                path: 'categoria',
                select: 'nombre'
            }
        });
    console.log(producto)

    return res.json({
        ok: true,
        producto
    });

}

const borrarProducto = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await Producto.findById(id);

    if (estado === true) {

        const productoBorrado = await Producto.findByIdAndUpdate(id, { estado: false }, { new: true })
            .populate('autor', 'nombre')
            .populate('editorial', 'nombre')
            .populate({
                path: 'subCategoria',
                select: 'nombre',
                populate: {
                    path: 'categoria',
                    select: 'nombre'
                }
            });;

        return res.json({
            ok: true,
            msg: 'Producto eliminado',
            productoBorrado
        });

    } else if (estado === false) {

        const productoRestaurado = await Producto.findByIdAndUpdate(id, { estado: true }, { new: true })
            .populate('autor', 'nombre')
            .populate('editorial', 'nombre')
            .populate({
                path: 'subCategoria',
                select: 'nombre',
                populate: {
                    path: 'categoria',
                    select: 'nombre'
                }
            });

        return res.json({
            ok: true,
            msg: 'Producto restaurado',
            productoRestaurado
        });

    }
}



module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    borrarProducto
}