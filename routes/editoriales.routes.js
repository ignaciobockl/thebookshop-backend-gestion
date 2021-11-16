/**
 * Ruta /api/editoriales
 */

const { Router } = require('express');
const { check } = require('express-validator');


const { 
    obtenerEditoriales, 
    obtenerEditorialPorId, 
    crearEditorial,
    actualizarEditorial,
    borrarEditorial
} = require('../controllers/editoriales.controllers');

const { existeEditorialPorId } = require('../helpers/db-validators');

const { 
    esAdminRole, 
    validarCampos, 
    validarJWT 
} = require('../middlewares');


const router = Router();


router.get( '/',  obtenerEditoriales);

router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeEditorialPorId),
    validarCampos
], obtenerEditorialPorId );

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], crearEditorial );

router.put('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeEditorialPorId),
    validarCampos
], actualizarEditorial );

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeEditorialPorId),
    validarCampos
], borrarEditorial );



module.exports = router;