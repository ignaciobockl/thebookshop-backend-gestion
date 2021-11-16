/**
 * Ruta /api/preguntas
 */

const { Router } = require('express');
const { check } = require('express-validator');

const { 
    obtenerPreguntasFrecuentes, 
    obtenerPreguntaFrecuentePorId, 
    crearPreguntaFrecuente,
    actualizarPreguntaFrecuente,
    borrarPreguntaFrecuente
} = require('../controllers/preguntasFrecuentes.controllers');

const { existePreguntaFrecuentePorId } = require('../helpers/db-validators');

 
const { 
    validarJWT, 
    validarCampos, 
    esAdminRole
} = require('../middlewares');
 
 
 
const router = Router();
 
 
router.get( '/', obtenerPreguntasFrecuentes );
 
router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existePreguntaFrecuentePorId),
    validarCampos
], obtenerPreguntaFrecuentePorId );
 
router.post('/', [
    validarJWT,
    check('pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    check('respuesta', 'La respuesta es obligatoria').not().isEmpty(),
    validarCampos
], crearPreguntaFrecuente );
 
router.put('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existePreguntaFrecuentePorId),
    validarCampos
], actualizarPreguntaFrecuente );
 
router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existePreguntaFrecuentePorId),
    validarCampos
], borrarPreguntaFrecuente );
 
 
 
module.exports = router;