const { response } = require('express');
const bcrypt = require('bcryptjs');

const Categoria = require('../models/categoria.model');
const SubCategoria = require('../models/subCategoria.model');



const obtenerCategorias = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, categorias] = await Promise.all([
        Categoria.count(estadoBorrado),
        Categoria.find(estadoBorrado)
        .populate('usuario', 'nombre')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json(categorias);
    // res.json({
    //     total,
    //     productos
    // });

}

const obtenerCategoriaPorId = async(req, res = response) => {

    const { id } = req.params;
    const categoria = await Categoria.findById(id)
        .populate('usuario', 'nombre');

    if ( categoria.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `La categoria: ${categoria.nombre} esta eliminada.`
        });
    }

    res.json(categoria);

}

const crearCategoria = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const categoriaDB = await Categoria.findOne({ nombre: body.nombre.toUpperCase() });
    if (categoriaDB) {

        if ( categoriaDB.estado === false ) {

            const data = {
                ...body,
                nombre: body.nombre.toUpperCase(),
                usuario: req.usuario._id
            }
        
        
            const categoria = new Categoria(data);
            console.log(categoria)
        
            await categoria.save();

            await Categoria.findByIdAndDelete( categoriaDB._id );
        
            res.status(201).json({
                ok: true,
                categoria
            });

        }

        return res.status(400).json({
            ok: false,
            msg: `La Categoria ${ categoriaDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar 
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }


    const categoria = new Categoria(data);
    console.log(categoria)

    //Guardar DB
    await categoria.save();

    res.status(201).json({
        ok: true,
        categoria
    });

}

const actualizarCategoria = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si la categoria no esta eliminado
    const eliminado = await Categoria.findById(id);
    if (eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'La Categoria que trata de modificar esta eliminado'
        });
    }

    if (data.nombre) {

        // Verificar si el nombre de la categoria existe en la db
        const categoriaDB = await Categoria.findOne({ nombre: data.nombre.toUpperCase() });
        if (categoriaDB) {
            return res.status(400).json({
                ok: false,
                msg: `La Categoria ${ categoriaDB.nombre }, ya existe, ingrese otro`
            });
        }

        data.nombre = data.nombre.toUpperCase();

    }

    if (data.nombre === '') {
        return res.status(400).json({
            ok: false,
            msg: 'El nombre es obligatorio'
        });
    }

    data.usuario = req.usuario._id;

    const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true });

    res.json({
        ok: true,
        categoria
    });

}

const borrarCategoria = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await Categoria.findById(id);

    if (estado === true) {

        const CategoriaBorrada = await Categoria.findByIdAndUpdate(id, { estado: false }, { new: true });
        return res.json({
            ok: true,
            msg: 'Categoria eliminada',
            CategoriaBorrada
        });

    } else if (estado === false) {

        const CategoriaRestaurada = await Categoria.findByIdAndUpdate(id, { estado: true }, { new: true });
        return res.json({
            ok: true,
            msg: 'Categoria restaurada',
            CategoriaRestaurada
        });

    }
}


module.exports = {
    obtenerCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    borrarCategoria
}