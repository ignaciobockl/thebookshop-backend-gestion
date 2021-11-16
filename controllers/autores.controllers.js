const { response } = require('express');

const Autor = require('../models/autor.model');



const obtenerAutores = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, autores] = await Promise.all([
        Autor.count(estadoBorrado),
        Autor.find(estadoBorrado)
        .populate('usuario', 'nombre')
        // .skip(Number(desde))
        // .limit(Number(limite))
    ]);

    res.json(autores);

}

const obtenerAutorPorId = async(req, res = response) => {

    const { id } = req.params;
    const autor = await Autor.findById(id)
        .populate('usuario', 'nombre');

    if ( autor.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `El autor: ${autor.nombre} esta eliminado.`
        });
    }

    res.json(autor);

}

const crearAutor = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const autorDB = await Autor.findOne({ nombre: body.nombre.toUpperCase() });
    if (autorDB) {

        if ( autorDB.estado === false ) {

            const data = {
                ...body,
                nombre: body.nombre.toUpperCase(),
                usuario: req.usuario._id
            }
        
            const autor = new Autor(data);
        
            await autor.save();

            // eliminar el anterior
            await Autor.findByIdAndDelete( autorDB._id );

        
            return res.status(201).json({
                ok: true,
                autor
            });

        }

        return res.status(400).json({
            ok: false,
            msg: `El Autor ${ autorDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar 
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const autor = new Autor(data);

    //Guardar DB
    await autor.save();

    res.status(201).json({
        ok: true,
        autor
    });

}

const actualizarAutor = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si el autor no esta eliminado
    const eliminado = await Autor.findById(id);
    if ( eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'El autor que trata de modificar esta eliminado'
        });
    }


    if (data.nombre) {

        // Verificar si el nombre del autor existe en la db
        const autorDB = await Autor.findOne({ nombre: data.nombre.toUpperCase() });
        if (autorDB) {
            return res.status(400).json({
                ok: false,
                msg: `El Autor ${ autorDB.nombre }, ya existe, ingrese otro`
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

    const autor = await Autor.findByIdAndUpdate(id, data, { new: true });

    res.json({
        ok: true,
        autor
    });

}

const borrarAutor = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await Autor.findById(id);

    if (estado === true) {

        const autorBorrado = await Autor.findByIdAndUpdate(id, { estado: false }, { new: true });
        return res.json({
            ok: true,
            msg: 'Autor eliminado',
            autorBorrado
        });

    } else if (estado === false) {

        const autorRestaurado = await Autor.findByIdAndUpdate(id, { estado: true }, { new: true });
         return res.json({
            ok: true,
            msg: 'Autor restaurado',
            autorRestaurado
        });

    }

}



module.exports = {
    crearAutor,
    obtenerAutores,
    obtenerAutorPorId,
    actualizarAutor,
    borrarAutor
}