const { response } = require("express");
const { collection } = require("../models/usuario.model");
const { ObjectId } = require('mongoose').Types;

// const { Usuario, Producto } = require('../models');
const Autor = require('../models/autor.model');
const Categoria = require('../models/categoria.model');
const Comprobante = require('../models/comprobante.model');
const CuponDescuento = require('../models/cuponDescuento.model');
const DetalleComprobante = require('../models/detalleComprobante.model');
const Editorial = require('../models/editorial.model');
const Evento = require('../models/evento.model');
const PreguntasFrecuentes = require('../models/preguntasFrecuentes.model');
const Producto = require('../models/producto.model');
const SubCategoria = require('../models/subCategoria.model');
const Usuario = require('../models/usuario.model');

const coleccionesPermitidas = [
    'productos',
    'roles',
    'usuarios',
    'categorias',
    'comprobantes',
    'eventos'
];

const filtrosPremitidos = [
    'titulo',

]

const buscarUsuariosPorNombre = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if (esMongoID) {
        const usuario = await Usuario.findById(termino);
        res.json({
            results: (usuario) ? [usuario] : []
        });
    }
    console.log(esMongoID)

    const regex = new RegExp(termino, 'i');
    console.log(regex)

    const usuarios = await Usuario.find({
        $or: [{ nombre: regex }, { email: regex }],
        $and: [{ estado: true }]
    });
    console.log(usuarios)

    res.json(usuarios);
}

const buscarProductosPorTitulo = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if (esMongoID) {
        const producto = await Producto.findById(termino)
            /*.populate('categoria', 'nombre')*/
        ;
        res.json({
            results: (producto) ? [producto] : []
        });
    }

    const regex = new RegExp(termino, 'i');

    const productos = await Producto.find({
            $or: [{ titulo: regex } /*, { descripcion: regex }*/ ],
            $and: [{ estado: true }]
        })
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

    res.json(productos);
}

const buscarLibrosAutoresPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino.toUpperCase(), 'i');

    // const { autores, libros } = await Promise.all([
    //     Autor.find({ nombre: regex }),
    //     Producto.find({ titulo: regex }).populate('autor', 'nombre')
    // ]);

    const autores = await Autor.find({ nombre: regex, estado: true});
    const libros = await Producto.find({ titulo: regex, estado: true})
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

    const idAutor = autores[0];
    // const idLibro = libros[0];
    // console.log(idAutor)
    // console.log(idLibro)
    console.log(autores)


    if (idAutor === undefined) {

        if (libros === undefined) {
            console.log('no autor - no libro')
            return res.status(400).json({
                ok: false,
                msg: 'el autor o libro no se encontro - buscarLibrosAutoresPorNombre'
            });
        } else {
            console.log('no autor - si libro')
                // const resultado = autores.concat(libros);
            return res.json({
                autores,
                libros
            });
        }

    }

    const autoresLibros = await Producto.find({ autor: autores, estado: true})
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
    console.log('si autor')

    // const resultado = autoresLibros.concat(libros);

    res.json({
        autores: autoresLibros,
        libros
    });

}

const buscarLibrosPorAutor = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const autor = await Autor.findOne({ nombre: regex });

    if (autor === null) {
        return res.status(400).json({
            ok: false,
            msg: 'No se encontro el Autor - buscarLibrosPorAutor'
        });
    }

    const { _id } = autor;

    const libros = await Producto.find({ autor: _id, estado: true })
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

    res.json(libros);

}

const buscarLibrosPorEditorial = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const editorial = await Editorial.findOne({ nombre: regex });

    if (editorial === null) {
        return res.status(400).json({
            ok: false,
            msg: 'No se encontro la Editorial - buscarLibrosPorEditorial'
        });
    }

    const { _id } = editorial;

    const libros = await Producto.find({ editorial: _id , estado: true})
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
    console.log(libros)

    res.json(libros);

}

const buscarLibrosPorCategoria = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const cat = await Categoria.findOne({ nombre: regex });
    console.log(`categoria: ${cat}`)

    if (cat === null) {

        return res.status(400).json({
            ok: false,
            msg: 'No se encontraron las categorias - buscarLibrosPorCategoria'
        });

    }

    const subCat = await SubCategoria.find({ categoria: cat })
        .populate('categoria', 'nombre');
    // console.log(`subcategoria: ${subCat}`)

    if (subCat === null) {

        return res.status(400).json({
            ok: false,
            msg: `No se encontraron las subCategorias perteneciente a la categoria: ${ cat.nombre } - buscarLibrosPorCategoria`
        });

    }

    const libros = await Producto.find({ subCategoria: subCat, estado:true })
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
    console.log(`libros: ${libros}`)

    if (libros === null) {

        return res.status(400).json({
            ok: false,
            msg: `No se encontraron libros en la categoria: ${ cat.nombre } - buscarLibrosPorCategoria`
        });

    }

    res.json(libros);

}

const buscarLibrosPorSubCategoria = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const subCat = await SubCategoria.findOne({ nombre: regex });
    console.log(`subcategoria: ${subCat}`)

    if (subCat === null) {

        return res.status(400).json({
            ok: false,
            msg: `No se encontraron las subCategorias - buscarLibrosPorSubCategoria`
        });

    }

    const libros = await Producto.find({ subCategoria: subCat, estado: true})
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
    console.log(`libros: ${libros}`)

    if (libros === null) {

        return res.status(400).json({
            ok: false,
            msg: `No se encontraron libros en la categoria: ${ cat.nombre } - buscarLibrosPorCategoria`
        });

    }

    res.json(libros);

}

const buscarSubCategoriasPorCategoria = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const categoriaDB = await Categoria.findOne({ nombre: regex });
    if (categoriaDB === null) {
        return res.status(400).json({
            ok: false,
            msg: `No se encontro la categoria: ${ categoriaDB }`
        });
    }

    const subCat = await SubCategoria.find({ categoria: categoriaDB })
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre');
    if (subCat === null) {
        return res.status(400).json({
            ok: false,
            msg: `No se encontraron las subCategorias en la categoria: ${ categoriaDB }`
        })
    }

    res.json(subCat);
}

const buscarSubCategoriaPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const subcat = await SubCategoria.find({ nombre: regex })
        .populate('usuario', 'nombre')
        .populate('categoria', 'nombre')
        .limit(10);
    if (!subcat) {
        return res.status(404).json({
            ok: false,
            msg: `No hay sub categoria con el termino de busqueda: ${termino}`
        });
    }
    if (subcat.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay sub categoria con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(subcat)
}

const buscarComprobantePorNumero = async(termino = '', res = response) => {

    // const regex = new RegExp(termino, 'i');

    const comprobante = await Comprobante.findOne({ numero: termino })
        .populate('usuario', 'nombre')
        .populate('detalleComprobante')
        .populate('cupon', 'nombre codigo');
    if (!comprobante) {
        return res.status(400).json({
            ok: false,
            msg: `No existe un comprobante con el numero: ${termino}`
        });
    }

    return res.json([comprobante]);


}

const buscarComprobantesPorIdUsuario = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if (esMongoID) {

        const comprobantes = await Comprobante.find({ usuario: termino })
            .populate('usuario', 'nombre')
            .populate('detalleComprobante')
            .populate('cupon', 'nombre codigo');

        if (!comprobantes || comprobantes.length === 0) {
            return res.status(400).json({
                ok: false,
                msg: `No hay comprobantes generados por el usuario`
            });
        }

        res.json(comprobantes);

    } else {
        return res.status(400).json({
            ok: false,
            msg: 'El id ingresado no es un id valido de mongo'
        });
    }

}

const buscarDetalleComprobantePorComprobante = async(termino = '', res = response) => {

    const comprobante = await Comprobante.findOne({ numero: termino })
        .populate('usuario', 'nombre')
        .populate('detalleComprobante');
    if (!comprobante) {
        return res.status(400).json({
            ok: false,
            msg: `No existe un comprobante con el numero: ${termino}`
        });
    }

    const { detalleComprobante } = comprobante;
    const detComprobante = await DetalleComprobante.findOne({ _id: detalleComprobante._id });
    if (!detComprobante) {
        return res.status(400).json({
            ok: false,
            msg: `Error al buscar el detalle del comprobante: ${termino}`
        });
    }

    return res.json({
        ok: true,
        detComprobante
    });

}

const buscarEventosPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const eventos = await Evento.find({ nombre: regex, estado: true });
    if (eventos === null) {
        return res.status(400).json({
            ok: false,
            msg: `No se encontro el nombre del evento: ${ eventos }`
        });
    }
    if (eventos.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay eventos con ese termino de busqueda: ${ termino }`
        });
    }

    res.json(eventos);
}

const buscarEventosPorLugar = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const eventos = await Evento.find({ lugar: regex, estado: true});
    if (eventos === null) {
        return res.status(400).json({
            ok: false,
            msg: `No se encontro el lugar del evento: ${ termino }`
        });
    }
    if (eventos.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay eventos con ese termino de busqueda: ${ termino }`
        });
    }

    res.json(eventos);
}

const buscarAutoresPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const autores = await Autor.find({ nombre: regex })
        .populate('usuario', 'nombre')
        .limit(15);
    if (!autores) {
        return res.status(404).json({
            ok: false,
            msg: `No hay autores con el termino de busqueda: ${termino}`
        });
    }
    if (autores.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay autores con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(autores)
}

const buscarCategoriasPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const categorias = await Categoria.find({ nombre: regex })
        .populate('usuario', 'nombre')
        .limit(15);
    if (!categorias) {
        return res.status(404).json({
            ok: false,
            msg: `No hay categorias con el termino de busqueda: ${termino}`
        });
    }
    if (categorias.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay categorias con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(categorias)
}

const buscarEditorialesPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const editoriales = await Editorial.find({ nombre: regex })
        .populate('usuario', 'nombre')
        .limit(15);
    if (!editoriales) {
        return res.status(404).json({
            ok: false,
            msg: `No hay editoriales con el termino de busqueda: ${termino}`
        });
    }
    if (editoriales.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay editoriales con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(editoriales)
}

const buscarLibrosMasVendidos = async(termino = '', res = response) => {

    const estadoBorrado = { estado: true };

    const [totalDet, detalles] = await Promise.all([
        DetalleComprobante.count(estadoBorrado),
        DetalleComprobante.find(estadoBorrado)
    ]);

    for (let index = 0; index < totalDet; index++) {

        const { productos } = detalles[index];

        for (let index = 0; index < productos.length; index++) {

            const productoVendido = await Producto.findById(productos[index]._id);

            let vendido = 0;

            vendido = productoVendido.vendidos + productos[index].cantidad;

            const data = {
                vendidos: vendido
            }

            await Producto.findByIdAndUpdate(productoVendido._id, data, { new: true });

        }

    }

    const [tot, libros] = await Promise.all([
        Producto.count(estadoBorrado),
        Producto.find(estadoBorrado)
    ]);

    const resultado = {
        list: []
    }

    for (let libro in libros) {

        let idLibro = libros[libro]._id;

        const libroProd = await Producto.findById(idLibro)
            .populate('autor', 'nombre')
            .populate('editorial', 'nombre')
            .populate({
                path: 'subCategoria',
                select: 'nombre',
                populate: {
                    path: 'categoria',
                    select: 'nombre'
                }
            })
            .populate('usuario', 'nombre');

        if (libroProd.vendidos > 0) {
            resultado.list.push(libroProd);
        }

    }

    const result = resultado.list;

    // restaurar el valor de vendidos
    for (let libro in libros) {

        let idLibro = libros[libro]._id;
        const libroProd = await Producto.findById(idLibro);

        const dataRestaurar = {
            vendidos: 0
        }

        if (libroProd.vendidos > 0) {
            await Producto.findByIdAndUpdate(idLibro, dataRestaurar);
        }

    }

    return res.json(result);

}

const buscarCuponesPorNombre = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const cupones = await CuponDescuento.find({ nombre: regex })
        .populate('usuario', 'nombre')
        .limit(10);
    if (!cupones) {
        return res.status(404).json({
            ok: false,
            msg: `No hay cupones con el termino de busqueda: ${termino}`
        });
    }
    if (cupones.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay cupones con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(cupones)
}

const buscarCuponesPorCodigo = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const cupones = await CuponDescuento.find({ codigo: regex })
        .populate('usuario', 'nombre')
        .limit(10);
    if (!cupones) {
        return res.status(404).json({
            ok: false,
            msg: `No hay cupones con el termino de busqueda: ${termino}`
        });
    }
    if (cupones.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay cupones con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(cupones)
}

const buscarPreguntasFrecuentesPorPregunta = async(termino = '', res = response) => {

    const regex = new RegExp(termino, 'i');

    const preguntas = await PreguntasFrecuentes.find({ pregunta: regex })
        .populate('usuario', 'nombre')
        .limit(10);
    if (!preguntas) {
        return res.status(404).json({
            ok: false,
            msg: `No hay preguntas frecuentes con el termino de busqueda: ${termino}`
        });
    }
    if (preguntas.length === 0) {
        return res.status(400).json({
            ok: false,
            msg: `No hay preguntas frecuentes con ese termino de busqueda: ${ termino }`
        });
    }

    return res.json(preguntas)
}





const buscar = (req, res = response) => {

    const { coleccion, filtro, termino } = req.params;

    if (coleccionesPermitidas.includes(collection)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son ${ coleccionesPermitidas }`
        });
    }

    if (coleccion === 'usuarios') {

        return buscarUsuariosPorNombre(termino, res);

    } else if (coleccion === 'productos') {

        if (filtro === 'autor') {

            return buscarLibrosPorAutor(termino, res);

        } else if (filtro === 'tituloautor') {

            return buscarLibrosAutoresPorNombre(termino, res);

        } else if (filtro === 'editorial') {

            return buscarLibrosPorEditorial(termino, res);

        } else if (filtro === 'categoria') {

            return buscarLibrosPorCategoria(termino, res);

        } else if (filtro === 'subcat') {

            return buscarLibrosPorSubCategoria(termino, res);

        } else if (filtro === 'masvendidos') {

            return buscarLibrosMasVendidos(termino, res);

        }

        return buscarProductosPorTitulo(termino, res);

    } else if (coleccion === 'categorias') {

        if (filtro === 'subcatxcat') {

            return buscarSubCategoriasPorCategoria(termino, res);

        } else if (filtro === 'nombre') {

            return buscarCategoriasPorNombre(termino, res);

        }

    } else if (coleccion === 'comprobantes') {

        if (filtro === 'compnum') {

            return buscarComprobantePorNumero(termino, res);

        } else if (filtro === 'detcompxnumcomp') {

            return buscarDetalleComprobantePorComprobante(termino, res);

        } else if (filtro === 'compxuser') {

            return buscarComprobantesPorIdUsuario(termino, res);

        }

    } else if (coleccion === 'eventos') {

        if (filtro === 'nombre') {

            return buscarEventosPorNombre(termino, res);

        } else if (filtro === 'lugar') {

            return buscarEventosPorLugar(termino, res);

        }

    } else if (coleccion === 'autores') {

        if (filtro === 'nombre') {

            return buscarAutoresPorNombre(termino, res);

        }
    } else if (coleccion === 'editoriales') {

        if (filtro === 'nombre') {

            return buscarEditorialesPorNombre(termino, res);

        }

    } else if (coleccion === 'cupones') {

        if (filtro === 'nombre') {
            return buscarCuponesPorNombre(termino, res);
        } else if (filtro === 'codigo') {
            return buscarCuponesPorCodigo(termino, res);
        }

    } else if (coleccion === 'preguntas') {

        if (filtro === 'pregunta') {
            return buscarPreguntasFrecuentesPorPregunta(termino, res);
        }

    } else if (coleccion === 'subcategorias') {

        if (filtro === 'nombre') {
            return buscarSubCategoriaPorNombre(termino, res);
        }

    }

    // switch (coleccion) {
    //     case 'usuarios':
    //         buscarUsuariosPorNombre(termino, res);
    //         break;

    //     // case 'categorias':
    //     //     buscarCategorias(termino, res);
    //     //     break;

    //     case 'productos':
    //         buscarProductosPorTitulo(termino, res);
    //         break;

    //     default:
    //         res.status(400).json({
    //             msg: `No existe la coleccion, colecciones permitidas: ${ coleccionesPermitidas }`
    //         });
    // }

}


module.exports = {
    buscar
}