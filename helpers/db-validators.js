const Autor = require('../models/autor.model');
const Categoria = require('../models/categoria.model');
const Comprobante = require('../models/comprobante.model');
const CuponDescuento = require('../models/cuponDescuento.model');
const Editorial = require('../models/editorial.model');
const Evento = require('../models/evento.model');;
const Producto = require('../models/producto.model');
const Role = require('../models/role.model');
const SubCategoria = require('../models/subCategoria.model');
const Usuario = require('../models/usuario.model');
const PreguntaFrecuente = require('../models/preguntasFrecuentes.model');


const esRoleValido = async(rol = '') => {

    const existeRol = await Role.findOne({ rol });
    if (!existeRol) throw new Error(`El rol ${ rol } no esta registrado en la BD`);

}

const emailExiste = async(email = '') => {

    // Verificar si el correo existe (10 por defecto -- 100 mas seguro)
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) throw new Error(`El email: ${ email }, ya se encuentra registrado`);
}

/**
 * Usuarios
 */
const existeUsuarioPorId = async(id) => {

    // Verificar si el usuario existe
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) throw new Error(`El id del usuario no existe: ${ id }`);
}

/**
 * Productos 
 */
const existeProductoPorId = async(id) => {

    // Verificar si el producto existe
    const existeProducto = await Producto.findById(id);
    if (!existeProducto) throw new Error(`El id del producto no existe: ${ id }`);

}

/**
 * Editoriales
 */
 const existeEditorialPorId = async(id) => {

    // Verificar si la editorial existe
    const existeEditorial = await Editorial.findById(id);
    if (!existeEditorial) throw new Error(`El id de la editorial no existe: ${ id }`);

}

/**
 * Autores
 */
 const existeAutorPorId = async(id) => {

    // Verificar si el autor existe
    const existeAutor = await Autor.findById(id);
    if (!existeAutor) throw new Error(`El id del autor no existe: ${ id }`);

}

/**
 * Preguntas Frecuentes
 */
 const existePreguntaFrecuentePorId = async(id) => {

    // Verificar si la pregunta frecuente existe
    const existePreguntaFrecuente = await PreguntaFrecuente.findById(id);
    if (!existePreguntaFrecuente) throw new Error(`El id de la pregunta frecuente no existe: ${ id }`);

}

/**
 * Cupones
 */
 const existeCuponDescuentoPorId = async(id) => {

    // Verificar si la editorial existe
    const existeCupon = await CuponDescuento.findById(id);
    if (!existeCupon) throw new Error(`El id del cupon de descuento no existe: ${ id }`);

}

/**
 * Eventos
 */
 const existeEventoPorId = async(id) => {

    // Verificar si la editorial existe
    const existeEvento = await Evento.findById(id);
    if (!existeEvento) throw new Error(`El id del evento no existe: ${ id }`);

}

/**
 * Categoria
 */
 const existeCategoriaPorId = async(id) => {

    // Verificar si la editorial existe
    const existeCategoria = await Categoria.findById(id);
    if (!existeCategoria) throw new Error(`El id de la Categoria no existe: ${ id }`);

}

/**
 * Comprobante
 */
 const existeComprobantePorId = async(id) => {

    // Verificar si la editorial existe
    const existeComprobante = await Comprobante.findById(id);
    if (!existeComprobante) throw new Error(`El id del Comprobante no existe: ${ id }`);

}

/**
 * SubCategoria
 */
 const existeSubCategoriaPorId = async(id) => {

    // Verificar si la editorial existe
    const existeSubCategoria = await SubCategoria.findById(id);
    if (!existeSubCategoria) throw new Error(`El id de la SubCategoria no existe: ${ id }`);

}

/**
 * Validar colecciones permitidas
 */
const coleccionesPermitidas = ( coleccion = '', colecciones = [] ) => {

    const incluida = colecciones.includes( coleccion );
    if ( !incluida ) {
        throw new Error( `La colección ${ coleccion } no es permitida - ${ colecciones }` );
    }

    return true;
}



module.exports = {
    emailExiste,
    esRoleValido,
    existeAutorPorId,
    existeCategoriaPorId,
    existeComprobantePorId,
    existeCuponDescuentoPorId,
    existeEditorialPorId,
    existeEventoPorId,
    existePreguntaFrecuentePorId,
    existeProductoPorId,
    existeSubCategoriaPorId,
    existeUsuarioPorId,
    coleccionesPermitidas
}