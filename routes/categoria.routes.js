/**
 * Ruta /api/categorias
 */

const { Router } = require('express');
const { check } = require('express-validator');

const { 
    obtenerCategorias, 
    obtenerCategoriaPorId, 
    crearCategoria,
    actualizarCategoria,
    borrarCategoria
} = require('../controllers/categorias.controllers');

const { 
    existeSubCategoriaPorId, 
    existeCategoriaPorId 
} = require('../helpers/db-validators');

const { 
    validarCampos, 
    validarJWT, 
    esAdminRole
} = require('../middlewares');


const router = Router();


router.get('/'/*, validarJWT*/, obtenerCategorias );

router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeCategoriaPorId),
    validarCampos
], obtenerCategoriaPorId );

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], crearCategoria );

router.put('/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('id').custom(existeCategoriaPorId),
    // check('subCategoria', 'No es un id de Mongo válido - subCategoria').isMongoId(),
    // check('subCategoria').custom(existeSubCategoriaPorId),
    validarCampos
], actualizarCategoria );

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo').isMongoId(),
    check('id').custom(existeCategoriaPorId),
    validarCampos
], borrarCategoria );



module.exports = router;