const dbValidators = require('./db-validators');
const googleVerify = require('./google-verify');
const jwt = require('./jwt');
const subirArchivo = require('./subir-archivo');


module.exports = {
    ...dbValidators,
    ...googleVerify,
    ...jwt,
    ...subirArchivo
}