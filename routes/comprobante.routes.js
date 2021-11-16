/**
* Ruta /api/comprobantes
*/
const { Router } = require('express');
const { check } = require('express-validator');

const { 
    generarComprobante, 
    obtenerComprobantes, 
    obtenerComprobantePorId
} = require('../controllers/comprobante.controllers');

const { existeComprobantePorId } = require('../helpers/db-validators');

const { 
    validarCampos, 
    validarJWT, 
    esAdminRole
} = require('../middlewares');


const router = Router();

router.get( '/' , obtenerComprobantes );

router.get('/:id',[
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeComprobantePorId),
    validarCampos
], obtenerComprobantePorId );

router.post( '/generar', generarComprobante);


module.exports = router;