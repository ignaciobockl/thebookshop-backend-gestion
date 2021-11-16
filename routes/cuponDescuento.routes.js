/**
* Ruta /api/cupones
*/

const { Router } = require('express');
const { check } = require('express-validator');

const { 
    crearCupon, 
    obtenerCupones, 
    actualizarCupon,
    aplicarCupon,
    borrarCupon
} = require('../controllers/cuponDescuento.controllers');

const { existeCuponDescuentoPorId } = require('../helpers/db-validators');

const { 
    validarJWT, 
    validarCampos, 
    esAdminRole
} = require('../middlewares');

const router = Router();

router.get( '', obtenerCupones );

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], crearCupon );

router.post( '/:codigo', aplicarCupon );

router.put('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeCuponDescuentoPorId),
    validarCampos
], actualizarCupon );

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeCuponDescuentoPorId),
    validarCampos
], borrarCupon );



module.exports = router;