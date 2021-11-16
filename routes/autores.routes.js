/**
 * Ruta /api/autores
 */

const { Router } = require('express');
const { check } = require('express-validator');

const { 
    obtenerAutores, 
    obtenerAutorPorId, 
    crearAutor, 
    actualizarAutor,
    borrarAutor
} = require('../controllers/autores.controllers');

const { existeAutorPorId } = require('../helpers/db-validators');

const { 
    validarJWT, 
    validarCampos, 
    esAdminRole
} = require('../middlewares');



const router = Router();


router.get( '/', obtenerAutores );

router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeAutorPorId),
    validarCampos
], obtenerAutorPorId );

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], crearAutor );

router.put('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeAutorPorId),
    validarCampos
], actualizarAutor );

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeAutorPorId),
    validarCampos
], borrarAutor );



module.exports = router;