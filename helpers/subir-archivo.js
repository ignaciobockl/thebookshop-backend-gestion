const path = require('path');
const { v4: uuidv4 } = require('uuid');


const subirArchivo = ( files, extensionesValidas = ['png','jpg','jpge','gif'], carpeta = '' ) => {

    return new Promise( ( resolve, reject ) => {

        const { archivo } = files;
        const nombreCortado = archivo.name.split('.');
        const extension = nombreCortado[ nombreCortado.length - 1 ];
        console.log(extension)

        // Validar la extension
        if ( !extensionesValidas.includes(extension) ) {
            return reject(`La extensión ${ extension } no es permitida - permitidas: ${ extensionesValidas }`);
        }

        const nombreTemp = uuidv4() + '.' + extension;
        const uploadPath = path.join( __dirname, '../uploads/', carpeta, nombreTemp );

        archivo.mv(uploadPath, (err) => {
            if (err) {
                console.log(err);
                return reject(err);
            }

            resolve( nombreTemp );
        });

    });

}


module.exports = {
    subirArchivo
}