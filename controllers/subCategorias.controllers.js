const { response } = require('express');

const SubCategoria = require('../models/subCategoria.model');
const Categoria = require('../models/categoria.model');



const obtenerSubCategorias = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, subCategorias] = await Promise.all([
        SubCategoria.count(estadoBorrado),
        SubCategoria.find(estadoBorrado)
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json(subCategorias);

}

const obtenerSubCategoriaPorId = async(req, res = response) => {

    const { id } = req.params;
    const subCategoria = await SubCategoria.findById(id)
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre');

    if ( subCategoria.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `La subCategoria: ${subCategoria.nombre} esta eliminada.`
        });
    }

    res.json(subCategoria);

}

const crearSubCategoria = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const subCategoriaDB = await SubCategoria.findOne({ nombre: body.nombre.toUpperCase() });
    if (subCategoriaDB) {

        if ( subCategoriaDB.estado === false ) {

            // Generar la data a guardar 
            const data = {
                ...body,
                nombre: body.nombre.toUpperCase(),
                usuario: req.usuario._id
            }
            console.log(data)
        
            const subCategoria = new SubCategoria(data);
        
            //Guardar DB
            await subCategoria.save();

            await SubCategoria.findByIdAndDelete(subCategoriaDB._id);
        
            res.status(201).json({
                ok: true,
                subCategoria
            });

        }

        return res.status(400).json({
            ok: false,
            msg: `La SubCategoria ${ subCategoriaDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar 
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }
    console.log(data)

    const subCategoria = new SubCategoria(data);

    //Guardar DB
    await subCategoria.save();

    res.status(201).json({
        ok: true,
        subCategoria
    });

}

const actualizarSubCategoria = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si la subCategoria no esta eliminado
    const eliminado = await SubCategoria.findById(id);
    if ( eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'La SubCategoria que trata de modificar esta eliminado'
        });
    }

    if (data.nombre) {

        // // Verificar si el nombre de la subCategoria existe en la db
        // const subCategoriaDB = await SubCategoria.findOne({ nombre: data.nombre.toUpperCase() });
        // if (subCategoriaDB) {
        //     return res.status(400).json({
        //         ok: false,
        //         msg: `La SubCategoria ${ subCategoriaDB.nombre }, ya existe, ingrese otro`
        //     });
        // }

        data.nombre = data.nombre.toUpperCase();

    }

    if (data.nombre === '') {
        return res.status(400).json({
            ok: false,
            msg: 'El nombre es obligatorio'
        });
    }

    // Verificar si se cambio la categoria y validarla
    try {

        const categoriaDB = await Categoria.findById(data.categoria);
        
        if ( categoriaDB !== null ) {

            if ( isValidObjectId(categoriaDB) ) {
                data.categoria = categoriaDB._id;
            }
            
        }
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'No es un id de Mongo válido - categoria'
        });
    }


    data.usuario = req.usuario._id;

    const subCategoria = await SubCategoria.findByIdAndUpdate(id, data, { new: true })
        .populate('categoria', 'nombre');

    res.json({
        ok: true,
        subCategoria
    });

}

const borrarSubCategoria = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await SubCategoria.findById(id);

    if (estado === true) {

        const subCategoriaBorrada = await SubCategoria.findByIdAndUpdate(id, { estado: false }, { new: true })
            .populate('categoria', 'nombre');
        return res.json({
            ok: true,
            msg: 'Subcategoria eliminada',
            subCategoriaBorrada
        });

    } else if (estado === false) {

        const subCategoriaRestaurada = await SubCategoria.findByIdAndUpdate(id, { estado: true }, { new: true })
            .populate('categoria', 'nombre');
        return res.json({
            ok: true,
            msg: 'Subcategoria restaurada',
            subCategoriaRestaurada
        });

    }

}



module.exports = {
    obtenerSubCategorias,
    obtenerSubCategoriaPorId,
    crearSubCategoria,
    actualizarSubCategoria,
    borrarSubCategoria
}