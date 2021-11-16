/**
* Ruta: 'api/uploads'
*/

const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');

const { 
    cargarArchivo, 
    actualizarArchivo, 
    mostrarImagen, 
    actualizarImagenCloudinary, 
    mostrarImagenCloudinary
} = require('../controllers/uploads.controllers');

const { coleccionesPermitidas } = require('../helpers');
const { validarArchivoSubir } = require('../middlewares');
 
 
const router = Router();


router.get( '/:coleccion/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('coleccion').custom( c => coleccionesPermitidas( c, ['usuarios','productos','eventos'] ) ),
    validarCampos
], mostrarImagen );
 
router.post( '/', validarArchivoSubir, cargarArchivo );

router.put( '/:coleccion/:id',[
    validarArchivoSubir,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('coleccion').custom( c => coleccionesPermitidas( c, ['usuarios','productos','eventos'] ) ),
    validarCampos
], actualizarImagenCloudinary);
// ], actualizarArchivo);
 
 
module.exports = router;