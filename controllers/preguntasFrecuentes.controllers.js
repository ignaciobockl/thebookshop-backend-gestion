const { response } = require('express');

const PreguntasFrecuentes = require('../models/preguntasFrecuentes.model');



const obtenerPreguntasFrecuentes = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, preguntas] = await Promise.all([
        PreguntasFrecuentes.count(estadoBorrado),
        PreguntasFrecuentes.find(estadoBorrado)
        .populate('usuario', 'nombre')
        // .skip(Number(desde))
        // .limit(Number(limite))
    ]);

    return res.json(preguntas);

}

const obtenerPreguntaFrecuentePorId = async(req, res = response) => {

    const { id } = req.params;
    const preguntas = await PreguntasFrecuentes.findById(id)
        .populate('usuario', 'nombre');

    return res.json(preguntas);

}

const crearPreguntaFrecuente = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const preguntaDB = await PreguntasFrecuentes.findOne({ pregunta: body.pregunta.toUpperCase() });
    if (preguntaDB) {

        if (preguntaDB.estado === false) {

            const respuestaDB = await PreguntasFrecuentes.findOne({ respuesta: body.respuesta.toUpperCase() });
            if (respuestaDB) {
                return res.status(400).json({
                    ok: false,
                    msg: `La pregunta ${ preguntaDB.pregunta } y respuesta ${ respuestaDB.respuesta }, ya existe`
                })
            }

            // Generar la data a guardar 
            const data = {
                ...body,
                pregunta: body.pregunta.toUpperCase(),
                respuesta: body.respuesta.toUpperCase(),
                usuario: req.usuario._id
            }

            const preg = new PreguntasFrecuentes(data);

            //Guardar DB
            await preg.save();

            // eliminar la anterior
            await preguntaDB.findByIdAndDelete( preguntaDB._id );

            return res.status(201).json({
                ok: true,
                preg
            });

        }

        return res.status(400).json({
            ok: false,
            msg: `La pregunta ${ preguntaDB.pregunta }, ya existe`
        });
    }

    // Generar la data a guardar 
    const data = {
        ...body,
        pregunta: body.pregunta.toUpperCase(),
        respuesta: body.respuesta.toUpperCase(),
        usuario: req.usuario._id
    }

    const preg = new PreguntasFrecuentes(data);

    //Guardar DB
    await preg.save();

    return res.status(201).json({
        ok: true,
        preg
    });

}

const actualizarPreguntaFrecuente = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si la pregunta no esta eliminada
    const eliminado = await PreguntasFrecuentes.findById(id);
    if (eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'La pregunta que trata de modificar esta eliminada'
        });
    }


    // if (data.pregunta) {

    //     // Verificar si la pregunta existe en la db
    //     const preguntaDB = await PreguntasFrecuentes.findOne({ pregunta: data.pregunta.toUpperCase() });
    //     if (preguntaDB) {
    //         return res.status(400).json({
    //             ok: false,
    //             msg: `La pregunta ${ preguntaDB.pregunta }, ya existe, ingrese otra`
    //         });
    //     }

    //     data.pregunta = data.pregunta.toUpperCase();
    // }

    if (data.pregunta.toUpperCase()) {

        // Verificar si la pregunta existe en la db
        const preguntaaDB = await PreguntasFrecuentes.findOne({ pregunta: data.pregunta.toUpperCase() });

        if (preguntaaDB) {

            console.log(`Id: ${id}`);
            console.log(`preguntaDB._id: ${preguntaaDB._id}`);

            if (id.toString() === preguntaaDB._id.toString()) {
                console.log('los id son iguales, acepta el titulo');
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `La pregunta ${ preguntaaDB.pregunta }, ya existe, ingrese otra`
                });
            }

        }

        data.pregunta = data.pregunta.toUpperCase();

    }

    if (data.pregunta === '') {
        return res.status(400).json({
            ok: false,
            msg: 'La pregunta es obligatoria'
        });
    }

    if (data.respuesta === '') {
        return res.status(400).json({
            ok: false,
            msg: 'La respuesta es obligatoria'
        });
    }

    if (data.respuesta) {
        data.respuesta = data.respuesta.toUpperCase();
    }

    data.usuario = req.usuario._id;

    const preg = await PreguntasFrecuentes.findByIdAndUpdate(id, data, { new: true });

    return res.json({
        ok: true,
        preg
    });

}

const borrarPreguntaFrecuente = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await PreguntasFrecuentes.findById(id);

    if (estado === true) {

        const preguntaFrecuenteBorrada = await PreguntasFrecuentes.findByIdAndUpdate(id, { estado: false }, { new: true })
            .populate('usuario', 'nombre');
        return res.json({
            ok: true,
            msg: 'Pregunta Frecuente eliminada',
            preguntaFrecuenteBorrada
        });

    } else if (estado === false) {

        const preguntaFrecuenteRestaurada = await PreguntasFrecuentes.findByIdAndUpdate(id, { estado: true }, { new: true })
            .populate('usuario', 'nombre');
        return res.json({
            ok: true,
            msg: 'Pregunta Frecuente restaurada',
            preguntaFrecuenteRestaurada
        });

    }

}



module.exports = {
    obtenerPreguntasFrecuentes,
    obtenerPreguntaFrecuentePorId,
    crearPreguntaFrecuente,
    actualizarPreguntaFrecuente,
    borrarPreguntaFrecuente
}