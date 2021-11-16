/**
 * Ruta /api/subCategorias
 */

 const { Router } = require('express');
 const { check } = require('express-validator');

const { 
    obtenerSubCategorias, 
    obtenerSubCategoriaPorId, 
    crearSubCategoria,
    actualizarSubCategoria,
    borrarSubCategoria
} = require('../controllers/subCategorias.controllers');

const { existeSubCategoriaPorId, existeCategoriaPorId } = require('../helpers');

const { 
    validarCampos, 
    validarJWT, 
    esAdminRole
} = require('../middlewares');


 const router = Router();


router.get( '/', obtenerSubCategorias );

router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeSubCategoriaPorId),
    validarCampos
], obtenerSubCategoriaPorId );

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'No es un id de Mongo válido - categoria').isMongoId(),
    check('categoria').custom(existeCategoriaPorId),
    validarCampos
], crearSubCategoria );

router.put('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeSubCategoriaPorId),
    validarCampos
], actualizarSubCategoria );

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeSubCategoriaPorId),
    validarCampos
], borrarSubCategoria );



module.exports = router;