/**
 * Ruta /api/eventos
 */

const { Router } = require('express');
const { check } = require('express-validator');

const { 
    crearEvento, 
    obtenerEventos, 
    obtenerEventoPorId, 
    actualizarEvento,
    borrarEvento
} = require('../controllers/evento.controllers');

const { existeEventoPorId } = require('../helpers');
 
const { 
    validarJWT, 
    validarCampos, 
    esAdminRole
} = require('../middlewares');
 
 
 
const router = Router();
 
 
router.get( '/', obtenerEventos );
 
router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeEventoPorId),
    validarCampos
], obtenerEventoPorId );
 
router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], crearEvento );
 
router.put('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeEventoPorId),
    validarCampos
], actualizarEvento );
 
router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeEventoPorId),
    validarCampos
], borrarEvento );



module.exports = router;