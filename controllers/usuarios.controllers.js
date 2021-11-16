const { response, request } = require("express");
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const Role = require('../models/role.model');
const Provincia = require('../models/provincia.model');


const obtenerUsuarios = async(req = request, res = response) => {

    const {
        limite = 5,
            desde = 0
    } = req.query;

    const estadoBorrado = { estado: true };

    const [total, usuarios] = await Promise.all([
        Usuario.count(estadoBorrado),
        Usuario.find(estadoBorrado)
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    if ( usuarios.length < 1 ) {

        return res.status(400).json({
            ok: false,
            msg: 'No hay usuarios!!!'
        });

    }

    res.json({
        total,
        usuarios
    });
}

const obtenerUsuarioPorId = async(req, res = response) => {

    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    if ( usuario.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: `El usuario: ${usuario.nombre} esta eliminado.`
        });
    }

    res.json(usuario);

}

const crearUsuario = async(req, res = response) => {

    const { nombre, email, password, rol, ...resto } = req.body;

    const usuario = new Usuario({ nombre, email, password, rol });

    const existeRol = await Role.findOne({ rol });
    if (!existeRol) return res.status(400).json({
        ok: false,
        msg: `El rol ingresado: ${ rol } no existe en la DB`
    });

    // Asignar foto por defecto al usuario
    if (!resto.img || resto.img === null || resto.img === undefined) {

        const user = await Usuario.findOne({ email: 'admin@admin.com' })
        usuario.img = user.img;

    }

    // Validar Provincia
    if (resto.provincia) {

        const regex = new RegExp(resto.provincia, 'i');

        const provinciaDB = await Provincia.findOne({ provincia: regex });
        console.log(provinciaDB);

        if (!provinciaDB) {
            return res.status(400).json({
                ok: false,
                msg: `La provincia ingresada ${ resto.provincia } no existe`
            });
        }
        console.log(provinciaDB.provincia)

        usuario.provincia = provinciaDB.provincia;

    } else {
        return res.status(400).json({
            ok: false,
            msg: 'La provincia es obligatoria'
        });
    }

    // Validar CP
    if (resto.codigoPostal) {

        if (resto.codigoPostal >= 1000) {

            if (resto.codigoPostal <= 9999) {

                usuario.codigoPostal = resto.codigoPostal;

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
                });
            }

        } else {
            return res.status(400).json({
                ok: false,
                msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
            });
        }
    } else {
        return res.status(400).json({
            ok: false,
            msg: 'El codigo postal es obligatorio'
        });
    }

    // Celular
    if ( resto.celular ) {

        if ( resto.celular >= 100000000000 && resto.celular <= 999999999999999){
            usuario.celular = resto.celular;
        } else{
            return res.status(400).json({
                ok: false,
                msg: 'Numero invalido - ej: 5493814951247'
            })
        }

    } else {
        return res.status(400).json({
            ok: false,
            msg: 'El numero de celular es obligatorio'
        });
    }

    // Encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    usuario.nombre = nombre.toUpperCase();
    usuario.localidad = resto.localidad.toUpperCase();
    usuario.direccion = resto.direccion.toUpperCase();

    // Guardar en BD
    await usuario.save();

    res.json({
        ok: true,
        usuario
    });
}

const registroUsuario = async(req, res = response) => {

    const { nombre, email, password, ...resto } = req.body;

    const usuario = new Usuario({ nombre, email, password });

    // Asignar foto por defecto al usuario
    if (!resto.img || resto.img === null || resto.img === undefined) {

        const user = await Usuario.findOne({ email: 'admin@admin.com' })
        usuario.img = user.img;

    }

    // Rol por defecto
    usuario.rol = 'USER_ROLE';

    // Validar Provincia
    if (resto.provincia) {

        const regex = new RegExp(resto.provincia, 'i');

        const provinciaDB = await Provincia.findOne({ provincia: regex });

        if (!provinciaDB) {
            return res.status(400).json({
                ok: false,
                msg: `La provincia ingresada ${ resto.provincia } no existe`
            });
        }

        usuario.provincia = provinciaDB.provincia.toUpperCase();

    } else {
        return res.status(400).json({
            ok: false,
            msg: 'La provincia es obligatoria'
        });
    }


    // Validar CP
    if (resto.codigoPostal) {

        if (resto.codigoPostal >= 1000) {

            if (resto.codigoPostal <= 9999) {

                usuario.codigoPostal = resto.codigoPostal;

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
                })
            }

        } else {
            return res.status(400).json({
                ok: false,
                msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
            })
        }
    } else {
        return res.status(400).json({
            ok: false,
            msg: 'El codigo postal es obligatorio - ej: 4002'
        })
    }


    // Celular
    if ( resto.celular ) {

        if ( resto.celular >= 1000000000 && resto.celular <= 999999999999999){
            usuario.celular = resto.celular;
        } else{
            return res.status(400).json({
                ok: false,
                msg: 'Numero invalido - ej: 3814951247'
            })
        }

    } else {
        return res.status(400).json({
            ok: false,
            msg: 'El numero de celular es obligatorio'
        });
    }

    // Encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    usuario.nombre = nombre.toUpperCase();
    usuario.localidad = resto.localidad.toUpperCase();
    usuario.direccion = resto.direccion.toUpperCase();

    // Guardar en BD
    await usuario.save();

    res.json({
        ok: true,
        usuario
    });
}

const modificarUsuario = async(req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, email, ...resto } = req.body;

    // Verificar si el usuario no esta eliminado
    const eliminado = await Usuario.findById(id);
    if (eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'El Usuario que trata de modificar esta eliminado'
        });
    }

    // Validar ROLE
    if (resto.rol) {

        const existeRol = await Role.findOne({ rol: resto.rol });
        if (!existeRol) return res.status(400).json({
            ok: false,
            msg: `El rol ingresado: ${ resto.rol } no existe en la DB`
        });

    }

    // TODO validar contra base de datos
    if (password !== undefined) {

        if (password === undefined || password === '') {

            return res.status(400).json({
                ok: false,
                msg: 'La contraseña es obligatoria'
            });

        } else {

            // Encriptar la contraseña
            const salt = bcrypt.genSaltSync();
            resto.password = bcrypt.hashSync(password, salt);

        }

    }

    // validar nombre
    if (resto.nombre === '') {
        return res.status(400).json({
            ok: false,
            msg: 'El nombre es obligatorio'
        });
    } else if (resto.nombre) {
        resto.nombre = resto.nombre.toUpperCase();
    }

    const usuarioDB = await Usuario.findById(id);
    if (!usuarioDB) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe el usuario con ese id en la db'
        });
    }

    // Validar Provincia
    if (resto.provincia) {

        const regex = new RegExp(resto.provincia, 'i');

        const provinciaDB = await Provincia.findOne({ provincia: regex });
        console.log(provinciaDB);

        if (!provinciaDB) {
            return res.status(400).json({
                ok: false,
                msg: `La provincia ingresada ${ resto.provincia } no existe`
            });
        }
        console.log(provinciaDB.provincia)

        resto.provincia = provinciaDB.provincia;

    }

    // Validar CP
    if (resto.codigoPostal) {

        if (resto.codigoPostal >= 1000) {

            if (resto.codigoPostal <= 9999) {

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
                })
            }

        } else {
            return res.status(400).json({
                ok: false,
                msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
            })
        }
    }

    // TODO verificar si hay cambios en el email y modificar
    if ( email ) {

        if (usuarioDB.email !== email) {

            const existeEmail = await Usuario.findOne({ email });
            if (existeEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario registrado con ese email'
                });
            }
    
        }

        resto.email = email;

    }

    // Celular
    if ( resto.celular ) {

        if ( resto.celular >= 100000000000 && resto.celular <= 999999999999999){

        } else{
            return res.status(400).json({
                ok: false,
                msg: 'Numero invalido - ej: 5493814951247'
            })
        }

    } 

    if ( resto.localidad ) {
        resto.localidad = resto.localidad.toUpperCase();
    }
    
    if ( resto.direccion ) {
        resto.direccion = resto.direccion.toUpperCase();
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

    res.json({
        ok: true,
        id,
        usuario
    });
}

const actualizarRegistradoUsuario = async(req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, email, ...resto } = req.body;

    // Verificar si el usuario no esta eliminado
    const eliminado = await Usuario.findById(id);
    if (eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'El Usuario que trata de modificar esta eliminado'
        });
    }

    if ( password ) {

        if ( password === undefined || password === '' || password === null ) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña es obligatoria'
            });
        }

        // Encriptar la contraseña
        const salt = bcrypt.genSaltSync();
        resto.password = bcrypt.hashSync(password, salt);

    }

    // validar nombre
    // if (resto.nombre) {
    //     resto.nombre = resto.nombre.toUpperCase();
    // }

    // if (resto.nombre === '') {
    //     return res.status(400).json({
    //         ok: false,
    //         msg: 'El nombre es obligatorio'
    //     });
    // }

    const usuarioDB = await Usuario.findById(id);
    if (!usuarioDB) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe el usuario con ese id en la db'
        });
    }

    // Validar Provincia
    if (resto.provincia) {

        const regex = new RegExp(resto.provincia, 'i');

        const provinciaDB = await Provincia.findOne({ provincia: regex });
        console.log(provinciaDB);

        if (!provinciaDB) {
            return res.status(400).json({
                ok: false,
                msg: `La provincia ingresada ${ resto.provincia } no existe`
            });
        }
        console.log(provinciaDB.provincia)

        resto.provincia = provinciaDB.provincia;

    }

    // Validar CP
    if (resto.codigoPostal) {

        if (resto.codigoPostal >= 1000) {

            if (resto.codigoPostal <= 9999) {

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
                })
            }

        } else {
            return res.status(400).json({
                ok: false,
                msg: `El Codigo Postal ingresado ${ resto.codigoPostal } no es válido`
            })
        }
    }

    // TODO verificar si hay cambios en el email y modificar
    // if ( email ) {

    //     if (usuarioDB.email !== email) {

    //         const existeEmail = await Usuario.findOne({ email });
    //         if (existeEmail) {
    //             return res.status(400).json({
    //                 ok: false,
    //                 msg: 'Ya existe un usuario registrado con ese email'
    //             });
    //         }
    
    //     }

    //     resto.email = email;

    // }

    // Celular
    if ( resto.celular ) {

        if ( resto.celular >= 1000000000 && resto.celular <= 999999999999999){
            
        } else{
            return res.status(400).json({
                ok: false,
                msg: 'Numero invalido - ej: 3814951247'
            })
        }

    } 

    if ( resto.localidad ) {
        resto.localidad = resto.localidad.toUpperCase();
    }
    
    if ( resto.direccion ) {
        resto.direccion = resto.direccion.toUpperCase();
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

    res.json({
        ok: true,
        id,
        usuario
    });
}

const borrarUsuario = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await Usuario.findById(id);

    if (estado === true) {

        const UsuarioBorrado = await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });
        return res.json({
            ok: true,
            msg: 'Usuario eliminado',
            UsuarioBorrado
        });

    } else if (estado === false) {

        const UsuarioRestaurado = await Usuario.findByIdAndUpdate(id, { estado: true }, { new: true });
        return res.json({
            ok: true,
            msg: 'Usuario restaurado',
            UsuarioRestaurado
        });

    }


}


module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    modificarUsuario,
    borrarUsuario,
    registroUsuario,
    actualizarRegistradoUsuario
}