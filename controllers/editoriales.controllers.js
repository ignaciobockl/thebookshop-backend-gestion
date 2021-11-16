const { response } = require('express');

const Editorial = require('../models/editorial.model');



const obtenerEditoriales = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, editoriales] = await Promise.all([
        Editorial.count(estadoBorrado),
        Editorial.find(estadoBorrado)
        .populate('usuario', 'nombre')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json(editoriales);

}

const obtenerEditorialPorId = async(req, res = response) => {

    const { id } = req.params;
    const editorial = await Editorial.findById(id)
        .populate('usuario', 'nombre');

    if ( editorial.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `La editorial: ${editorial.nombre} esta eliminada.`
        });
    }

    res.json(editorial);

}

const crearEditorial = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const editorialDB = await Editorial.findOne({ nombre: body.nombre.toUpperCase() });
    if (editorialDB) {

        if ( editorialDB.estado === false) {

            const data = {
                ...body,
                nombre: body.nombre.toUpperCase(),
                usuario: req.usuario._id
            }
        
            const editorial = new Editorial(data);
        
            await editorial.save();

            await Editorial.findByIdAndDelete(editorialDB._id);
        
            res.status(201).json({
                ok: true,
                editorial
            });

        }


        return res.status(400).json({
            ok: false,
            msg: `La Editorial ${ editorialDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar 
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const editorial = new Editorial(data);

    //Guardar DB
    await editorial.save();

    res.status(201).json({
        ok: true,
        editorial
    });

}

const actualizarEditorial = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si la editorial no esta eliminado
    const eliminado = await Editorial.findById(id);
    if ( eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'La Editorial que trata de modificar esta eliminado'
        });
    }

    if (data.nombre) {

         // Verificar si el nombre de la editorial existe en la db
         const editorialDB = await Editorial.findOne({ nombre: data.nombre.toUpperCase() });
         if (editorialDB) {
             return res.status(400).json({
                 ok: false,
                 msg: `La Editorial ${ editorialDB.nombre }, ya existe, ingrese otro`
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

    const editorial = await Editorial.findByIdAndUpdate(id, data, { new: true });

    res.json({
        ok: true, 
        editorial
    });

}

const borrarEditorial = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await Editorial.findById(id);

    if (estado === true) {

        const editorialBorrada = await Editorial.findByIdAndUpdate(id, { estado: false }, { new: true });
        return res.json({
            ok: true,
            msg: 'Editorial eliminada',
            editorialBorrada
        });

    } else if (estado === false) {

        const editorialRestaurada = await Editorial.findByIdAndUpdate(id, { estado: true }, { new: true });
         return res.json({
            ok: true,
            msg: 'Editorial restaurada',
            editorialRestaurada
        });

    }
}



module.exports = {
    actualizarEditorial,
    borrarEditorial,
    crearEditorial,
    obtenerEditoriales,
    obtenerEditorialPorId,
}