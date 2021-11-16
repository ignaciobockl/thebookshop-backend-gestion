const validarArchivoSubir = require('../middlewares/validar-archivo');
const validarCampos = require('../middlewares/validar-campos');
const validarJWT = require('../middlewares/validar-jwt');
const validarRoles = require('../middlewares/validar-roles');

module.exports = {
    ...validarArchivoSubir,
    ...validarCampos,
    ...validarJWT,
    ...validarRoles
}