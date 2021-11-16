const { response } = require('express');

const Evento = require('../models/evento.model');
const Usuario = require('../models/usuario.model');



const obtenerEventos = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, eventos] = await Promise.all([
        Evento.count(estadoBorrado),
        Evento.find(estadoBorrado)
        .populate('usuario', 'nombre')
        // .skip(Number(desde))
        // .limit(Number(limite))
    ]);

    res.json(eventos);

}

const obtenerEventoPorId = async(req, res = response) => {

    const { id } = req.params;
    const evento = await Evento.findById(id)
        .populate('usuario', 'nombre');

    if ( evento.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `El evento: ${evento.nombre} esta eliminado.`
        });
    }

    res.json(evento);

}

const crearEvento = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const eventoDB = await Evento.findOne({ nombre: body.nombre.toUpperCase() });
    if (eventoDB) {

        if ( eventoDB.estado === false) {

            if ( !body.lugar ) {
                return res.status(400).json({
                    ok: false, 
                    msg: 'El lugar del evento es obligatorio'
                });
            }
        
            // verificar la fecha y hora - pendiente
            if ( !body.fechaHora ) {
                return res.status(400).json({
                    ok: false, 
                    msg: 'La Fecha y Hora del evento son obligatorias'
                });
            }
        
        
            // Generar la data a guardar 
            const data = {
                ...body,
                nombre: body.nombre.toUpperCase(),
                usuario: req.usuario._id,
                lugar: body.lugar,
                fechaHora: body.fechaHora
            }
        
            // Asignar foto por defecto al evento
            if (!body.img || body.img === null || body.img === undefined) {
        
                const user = await Usuario.findOne({ email: 'admin@admin.com' })
                data.img = user.img;
        
            }
        
            const evento = new Evento(data);
            console.log(data)
        
            //Guardar DB
            await evento.save();

            await Evento.findByIdAndDelete(eventoDB._id);
        
            res.status(201).json({
                ok: true,
                evento
            });

        }

        return res.status(400).json({
            ok: false,
            msg: `El Evento ${ eventoDB.nombre }, ya existe`
        });
    }

    if ( !body.lugar ) {
        return res.status(400).json({
            ok: false, 
            msg: 'El lugar del evento es obligatorio'
        });
    }

    // verificar la fecha y hora - pendiente
    if ( !body.fechaHora ) {
        return res.status(400).json({
            ok: false, 
            msg: 'La Fecha y Hora del evento son obligatorias'
        });
    }


    // Generar la data a guardar 
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id,
        lugar: body.lugar,
        fechaHora: body.fechaHora
    }

    // Asignar foto por defecto al evento
    if (!body.img || body.img === null || body.img === undefined) {

        const user = await Usuario.findOne({ email: 'admin@admin.com' })
        data.img = user.img;

    }

    const evento = new Evento(data);
    console.log(data)

    //Guardar DB
    await evento.save();

    res.status(201).json({
        ok: true,
        evento
    });

}

const actualizarEvento = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si el evento no esta eliminado
    const eliminado = await Evento.findById(id);
    if (eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'El evento que trata de modificar esta eliminado'
        });
    }


    if (data.nombre) {

        // Verificar si el nombre del evento existe en la db
        const eventoDB = await Evento.findOne({ nombre: data.nombre.toUpperCase() });

        if (eventoDB) {

            console.log(`Id: ${id}`);
            console.log(`eventoDB._id: ${eventoDB._id}`);

            if (id.toString() === eventoDB._id.toString()) {
                console.log('los id son iguales, acepta el titulo');
            } else {

                return res.status(400).json({
                    ok: false,
                    msg: `El Evento ${ eventoDB.nombre }, ya existe, ingrese otro`
                });
            }

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

    const evento = await Evento.findByIdAndUpdate(id, data, { new: true });

    res.json({
        ok: true,
        evento
    });

}

const borrarEvento = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await Evento.findById(id);

    if (estado === true) {

        const eventoBorrado = await Evento.findByIdAndUpdate(id, { estado: false }, { new: true });
        return res.json({
            ok: true,
            msg: 'Evento eliminado',
            eventoBorrado
        });

    } else if (estado === false) {

        const eventoRestaurado = await Evento.findByIdAndUpdate(id, { estado: true }, { new: true });
        return res.json({
            ok: true,
            msg: 'Evento restaurado',
            eventoRestaurado
        });

    }

}



module.exports = {
    actualizarEvento,
    borrarEvento,
    crearEvento,
    obtenerEventos,
    obtenerEventoPorId
}