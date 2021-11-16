const { response } = require('express');

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const Usuario = require('../models/usuario.model');
const Provincia = require('../models/provincia.model');

//usuario admin
const usuarioPorDefecto = async(res = response) => {

    const user = await Usuario.findOne({ email: 'admin@admin.com' });
    let urlCloudy = 'a';
    if (user === null) {

        try {

            await cloudinary.uploader.upload('./assets/no-image.jpg',
                function(error, resultado) {
                    const { secure_url } = resultado;
                    urlCloudy = secure_url;
                }
            );

            if (urlCloudy === 'a') { return Error('Error al subir la imagen a cloudinary') }

            const data = {
                nombre: 'ADMIN',
                password: 'abc123456',
                email: 'admin@admin.com',
                rol: 'ADMIN_ROLE',
                img: urlCloudy
            }
            console.log(data)
            if (!data) { return Error('No se pudo generar la data') }

            const usuario = new Usuario(data);
            await usuario.save();
            console.log('Usuario Admin creado correctamente!')

        } catch (error) {
            console.log(error)
        }

    }

}

const provinciasPorDefecto = async ( res = response ) => {

    const prov = await Provincia.findOne({ provincia: 'BUENOS AIRES' });
    if ( !prov ) {

        const data = [
            {
                "provincia": "BUENOS AIRES"
            },
            {
                "provincia": "CAPITAL FEDERAL"
            },
            {
                "provincia": "CATAMARCA"
            },
            {
                "provincia": "CHACO"
            },
            {
                "provincia": "CHUBUT"
            },
            {
                "provincia": "CORDOBA"
            },
            {
                "provincia": "CORRIENTES"
            },
            {
                "provincia": "ENTRE RIOS"
            },
            {
                "provincia": "FORMOSA"
            },
            {
                "provincia": "JUJUY"
            },
            {
                "provincia": "LA PAMPA"
            },
            {
                "provincia": "LA RIOJA"
            },
            {
                "provincia": "MENDOZA"
            },
            {
                "provincia": "MISIONES"
            },
            {
                "provincia": "NEUQUEN"
            },
            {
                "provincia": "RIO NEGRO"
            },
            {
                "provincia": "SALTA"
            },
            {
                "provincia": "SAN JUAN"
            },
            {
                "provincia": "SAN LUIS"
            },
            {
                "provincia": "SANTA CRUZ"
            },
            {
                "provincia": "SANTA FE"
            },
            {
                "provincia": "SANTIAGO DEL ESTERO"
            },
            {
                "provincia": "TIERRA DEL FUEGO"
            },
            {
                "provincia": "TUCUMAN"
            },
        ];

        const provcre = await Provincia.create(data);
        console.log(`Provincias creadas correctamente: ${provcre}`)

    }


}


module.exports = {
    usuarioPorDefecto,
    provinciasPorDefecto
}