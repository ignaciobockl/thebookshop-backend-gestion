/**
 * Rute: 'api/login'
 */

const { Router } = require('express');
const { check } = require('express-validator');

const { 
    login, 
    googleSignIn, 
    revalidarToken 
} = require('../controllers/auth.controllers');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const router = Router();


router.post( '/login',[
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').not().isEmpty(),
    validarCampos
], login);

router.post('/google', [
    check('id_token', 'id_token (google) es necesario').not().isEmpty(),
    validarCampos
], googleSignIn);

router.get( '/renew', [
    validarJWT
], revalidarToken)



module.exports = router;