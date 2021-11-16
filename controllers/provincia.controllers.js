const { response } = require('express');

const Provincia = require('../models/provincia.model');



const obtenerProvincias = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, provincias] = await Promise.all([
        Provincia.count(estadoBorrado),
        Provincia.find(estadoBorrado)
        // .skip(Number(desde))
        // .limit(Number(limite))
    ]);

    res.json(provincias);

}


module.exports = {
    obtenerProvincias
}