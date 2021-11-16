/**
 * Ruta /api/provincias
 */

const { Router } = require('express');
const { check } = require('express-validator');

const { obtenerProvincias } = require('../controllers/provincia.controllers');

const router = Router();

router.get( '/', obtenerProvincias );

module.exports = router;