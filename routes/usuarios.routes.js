/** 
 * Ruta: /api/usuarios
 */

const { Router } = require('express');
const { check } = require('express-validator');


const {
    actualizarUsuario,
    borrarUsuario,
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    registroUsuario,
    actualizarRegistradoUsuario,
    modificarUsuario
} = require('../controllers/usuarios.controllers');

const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');

const {
    emailExiste,
    esRoleValido,
    existeUsuarioPorId
} = require('../helpers/db-validators');



const router = Router();

router.get('/', /*validarJWT,*/ obtenerUsuarios);

router.get('/:id', [
    // validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], obtenerUsuarioPorId);

router.post('/', [
    // validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('email', 'El email no es válido').isEmail(),
    check('email').custom(emailExiste),
    check('localidad', 'La localidad es obligatoria').not().isEmpty(),
    check('direccion', 'La direccion es obligatoria').not().isEmpty(),
    // check('rol').custom(esRoleValido),
    validarCampos
], crearUsuario);

router.post('/registro', [
    // validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('email', 'El email no es válido').isEmail(),
    check('email').custom(emailExiste),
    check('localidad', 'La localidad es obligatoria').not().isEmpty(),
    check('direccion', 'La direccion es obligatoria').not().isEmpty(),
    validarCampos
], registroUsuario);

router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    // check('rol').custom(esRoleValido),
    // check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    // check('email', 'El email no es válido').isEmail(),
    validarCampos
], modificarUsuario);

router.put('/registro/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    // check('rol').custom(esRoleValido),
    // check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    // check('email', 'El email no es válido').isEmail(),
    validarCampos
], actualizarRegistradoUsuario);

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    tieneRole('ADMIN_ROLE', 'USER_ROLE', 'VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], borrarUsuario);

module.exports = router;