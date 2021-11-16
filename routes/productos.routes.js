/**
 * Ruta /api/productos
 */

const { Router } = require('express');
const { check } = require('express-validator');

const {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    borrarProducto,
    obtenerProductoPorId
} = require('../controllers/producto.controllers');

const { 
    existeProductoPorId, 
    existeEditorialPorId, 
    existeAutorPorId 
} = require('../helpers/db-validators');

const {
    validarJWT,
    validarCampos,
    esAdminRole
} = require('../middlewares');


const router = Router();


router.get('/'/*, validarJWT*/, obtenerProductos);

router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], obtenerProductoPorId );

router.post('/', [
    validarJWT,
    check('titulo', 'El título es obligatorio').not().isEmpty(),
    check('editorial', 'No es un id de Mongo válido - editorial').isMongoId(),
    check('editorial').custom(existeEditorialPorId),
    check('autor', 'No es un id de Mongo válido - autor').isMongoId(),
    check('autor').custom(existeAutorPorId),
    validarCampos
], crearProducto);

router.put('/:id', [
    validarJWT,
    check('id').custom(existeProductoPorId),
    // check('editorial', 'No es un id de Mongo válido - editorial').isMongoId(),
    // check('editorial').custom(existeEditorialPorId),
    validarCampos
], actualizarProducto);

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], borrarProducto);



module.exports = router;