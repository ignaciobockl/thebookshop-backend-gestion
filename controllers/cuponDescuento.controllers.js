const { response } = require('express');

const CuponDescuento = require('../models/cuponDescuento.model');


const obtenerCupones = async(req, res = response) => {

    const estadoBorrado = { estado: true };

    const [total, cupones] = await Promise.all([
        CuponDescuento.count(estadoBorrado),
        CuponDescuento.find(estadoBorrado)
        .populate('usuario', 'nombre')
        // .skip(Number(desde))
        // .limit(Number(limite))
    ]);

    res.json(cupones);

}

const obtenerCuponesPorId = async(req, res = response) => {

    const { id } = req.params;
    const cupon = await CuponDescuento.findById(id)
        .populate('usuario', 'nombre');

    res.json(cupon);

}

const crearCupon = async(req, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const cuponDB = await CuponDescuento.findOne({ nombre: body.nombre.toUpperCase() });
    if (cuponDB) {
        return res.status(400).json({
            ok: false,
            msg: `El Cupon de Descuento: ${ cuponDB.nombre }, ya existe`
        });
    }
    

    // Generar la data a guardar 
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id,
    }

    // Generador de Codigo 8 digitos
    function makeid(length) {
        let result           = '';
        const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    let array = 1000;
    for (let index = 0; index < array; index++) {
        
        const codGen = makeid(8);
        console.log(codGen);

        const codigoDB = await CuponDescuento.findOne({ codigo: codGen });
        console.log(codigoDB);

        if ( codigoDB === null ) {
            array = 0;
            data.codigo = codGen;
        }
        
    }   


    // Verificacion tipo    
    if ( body.tipo === undefined || body.tipo === '' ) {
        return res.status(400).json({
            ok: false,
            msg: 'El tipo de Cupon es obligatorio'
        });
    } else {
        body.tipo.toUpperCase();
    }


    // Verificar tipo de cupon de Descuento
    if ( body.tipo === 'VOUCHER' ) {
        console.log(body.usos)

        if ( body.usos > 0 && body.usos < 101) {
            data.usos = body.usos;
        } else {
            return res.status(400).json({
                ok: false,
                msg: `La cantidad de usos para el Voucher debe ser mayor a 0 y menor a 101 - valor ingresado: ${body.usos}`
            });
        }

        if ( body.porcentaje > 0 ) {

            if ( body.porcentaje > 0 && body.porcentaje <= 100 ) {

                data.porcentaje = body.porcentaje;
                data.valor = 0;

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Porcentaje invalido: ${body.porcentaje} - 1% y 100%`
                });
            }

        } else {
            return res.status(400).json({
                ok: false,
                msg: `No hay valor del porcentaje: ${body.porcentaje}`
            });
        }

    } else if ( body.tipo === 'GIFT_CARD' ) {

        data.usos = 1;

        if ( body.valor > 0 ) {

            if ( body.valor > 0 ) {

                data.valor = body.valor;
                data.porcentaje = 0;

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Valor de la Gift Card invalido ${body.valor} - valor mayor a 0`
                });
            }
            

        } else {
            return res.status(400).json({
                ok: false,
                msg: `La Gift Card no tiene valor: ${body.valor}`
            });
        }

    } else {
        return res.status(400).json({
            ok: false,
            msg: 'El cupon debe tener un tipo - VOUCHER / GIFT_CARD'
        })
    }

    const cupon = new CuponDescuento(data);
    console.log(data)

    //Guardar DB
    await cupon.save();

    res.status(201).json({
        ok: true,
        cupon
    });

}

const actualizarCupon = async(req, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    // Verificar si el evento no esta eliminado
    const eliminado = await CuponDescuento.findById(id);
    if ( eliminado.estado === false) {
        return res.status(400).json({
            ok: false,
            msg: 'El cupon que trata de modificar esta eliminado'
        });
    }

    data.tipo = eliminado.tipo;


    if (data.nombre) {

        // Verificar si el nombre del evento existe en la db
        const cuponDB = await CuponDescuento.findOne({ nombre: data.nombre.toUpperCase() });
        
        if (cuponDB) {

            console.log(`Id: ${id}`);
            console.log(`cuponDB._id: ${cuponDB._id}`);

            if ( id.toString() === cuponDB._id.toString() ) {
                console.log('los id son iguales, acepta el titulo');
            } else {

                return res.status(400).json({
                    ok: false,
                    msg: `El Cupon ${ cuponDB.nombre }, ya existe, ingrese otro`
                });
            }

        }

        data.nombre = data.nombre.toUpperCase();
    }

    if (data.nombre === '') {
        return res.status(400).json({
            ok: false, 
            msg: 'El nombre es obligatorio'
        });
    }

    data.usuario = req.usuario._id;

    if ( data.valor ) {

        if ( data.tipo === 'GIFT_CARD' ) {

            if ( data.usos ) {

                if ( data.usos > 1 ) {
                    return res.status(400).json({
                        ok: false, 
                        msg: `La GIFT CARD solo puede tener 1 uso - valor invalido: ${data.usos}`
                    });
                } else if ( data.usos === 0 ) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La GIFT CARD no se puede modificar ya que fue utilizada y no tiene usos, en caso de querer modificarla debe ingresar 1 uso'
                    });
                }

            }

        }
        else {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede modificar el valor ya que el cupon de descuento no es una GIFT_CARD'
            });
        }

        if ( data.valor >= 1 ) {

        }
        else {
            return res.status(400).json({
                ok: false,
                msg: `El valor a modificar debe ser mayor a 0 - valor ingresado: ${data.valor}`
            });
        }

    }

    if ( data.porcentaje ) {

        if ( data.tipo === 'VOUCHER' ) {

            if ( data.usos ) {

                if ( data.usos >= 1 && data.usos <= 100 ) {
                    return res.status(400).json({
                        ok: false, 
                        msg: `El VOUCHER tiene usos entre 1 y 100 - valor invalido: ${data.usos}`
                    });
                } else if ( data.usos === 0 ) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'El VOUCHER no se puede modificar ya que fue utilizado y no tiene usos, en caso de querer modificarla debe ingresar usos entre 1 y 100'
                    });
                }

            }

            if ( data.porcentaje ) {

                if ( data.porcentaje > 0 && data.porcentaje < 101 ) {

                } else {
                    return res.status(400).json({
                        ok: false,
                        msg: `El valor del porcentaje debe ser entre 1 y 100 - valor ingreado: ${data.porcentaje}`
                    });
                }

            }

        }
        else {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede modificar el porcentaje ya que el cupon de descuento no es una VOUCHER'
            });
        }


    }

    const cupon = await CuponDescuento.findByIdAndUpdate(id, data, { new: true });

    res.json({
        ok: true,
        cupon
    });

}

const borrarCupon = async(req, res = response) => {

    const { id } = req.params;

    const { estado } = await CuponDescuento.findById(id);

    if (estado === true) {

        const cuponBorrado = await CuponDescuento.findByIdAndUpdate(id, { estado: false }, { new: true });
        return res.json({
            ok: true,
            msg: 'Cupon Descuento eliminado',
            cuponBorrado
        });

    } else if (estado === false) {

        const cuponRestaurado = await CuponDescuento.findByIdAndUpdate(id, { estado: true }, { new: true });
         return res.json({
            ok: true,
            msg: 'Cupon Descuento restaurado',
            cuponRestaurado
        });

    }

}

const aplicarCupon = async(req, res = response) => {

    const { codigo } = req.params;
    const cod = codigo;

    // Verificar que el codigo del cupon exista en la db
    const cupon = await CuponDescuento.findOne({ codigo: cod });
    if ( !cupon ) {
        return res.status(400).json({
            ok: false,
            msg: `No existe cupon de descuento con el codigo: ${ cod }`
        });
    }

    // Verificar que el cupon no este eliminado
    if ( cupon.estado === false ) {
        return res.status(404).json({
            ok: false,
            msg: 'El cupon de descuento esta eliminado'
        });
    }

    // Verificar que el cupon tenga usos disponibles
    if ( cupon.usos === 0 ) {
        return res.status(400).json({
            ok: false,
            msg: `El cupon ya fue utilizado, no contiene mas usos - usos disponibles: ${ cupon.usos }`
        })
    } else if ( cupon.usos > 0 ) {
        return res.json({
            ok: true,
            cupon
        });
    }


}




module.exports = {
    actualizarCupon,
    aplicarCupon,
    borrarCupon,
    crearCupon,
    obtenerCupones,
}