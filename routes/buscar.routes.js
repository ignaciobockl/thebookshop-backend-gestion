const { Router } = require('express');
const { check } = require('express-validator');
const { buscar } = require('../controllers/buscar.controller');


const router = Router();


router.get('/:coleccion/:filtro/:termino',[
    check('coleccion', 'La coleccion es obligatoria').not().isEmpty(),
    check('filtro', 'El filtro es obligatorio').not().isEmpty(),
    check('termino', 'El termino es obligatorio').not().isEmpty()
], buscar);


module.exports = router;