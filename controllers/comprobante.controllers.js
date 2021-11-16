const { response } = require('express');
const { isValidObjectId } = require('mongoose');

const Comprobante = require('../models/comprobante.model');
const DetalleComprobante = require('../models/detalleComprobante.model');
const Producto = require('../models/producto.model');
const Usuario = require('../models/usuario.model');
const CuponDescuento = require('../models/cuponDescuento.model');


const obtenerComprobantes = async(req, res = response) => {

    const { limite = 5000, desde = 0 } = req.query;

    const estadoBorrado = { estado: true };

    const [total, comprobantes] = await Promise.all([
        Comprobante.count(estadoBorrado),
        Comprobante.find(estadoBorrado)
        .populate('usuario', 'nombre')
        .populate('cupon', 'nombre')
        .populate('detalleComprobante')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json(comprobantes);

}

const obtenerComprobantePorId = async(req, res = response) => {

    const { id } = req.params;
    const comprobante = await Comprobante.findById(id)
        .populate('usuario', 'nombre')
        .populate('cupon', 'nombre')
        .populate('detalleComprobante');

    res.json(comprobante);

}

const generarComprobante = async(req, res = response) => {

    const { productos, usuario, cuponId, subTotal, descuento, total } = req.body;

    // generar numero comprobante
    let N = 2;
    for (let index = 1; index < N; index++) {

        const numeroComp = await Comprobante.findOne({ numero: index });

        if (numeroComp) {

            N = N + 1;

        } else {

            console.log(`Numero del siguiente comprobante: ${index}`);

            if (productos) {

                //Crear detalle del comprobante
                const dataDetalle = {
                    productos: productos
                }
                const detalle = new DetalleComprobante(dataDetalle);
                await detalle.save();

                const detalleComprobanteId = await DetalleComprobante.findById(detalle._id);

                if (!detalleComprobanteId) {

                    await DetalleComprobante.findByIdAndDelete(detalleComprobanteId);

                    return res.status(400).json({
                        ok: false,
                        msg: 'Error al crear el detalle del comprobante'
                    });
                }

                // Usuario
                const esMongoID = isValidObjectId(usuario); // TRUE

                if (esMongoID) {
                    const user = await Usuario.findById(usuario);
                    if (!user) {
                        return res.status(404).json({
                            ok: false,
                            msg: 'Error de Usuario - invalido o no existe'
                        })
                    }
                    // res.json({
                    //     results: (user) ? [user] : []
                    // });
                } else {
                    return res.status(400).json({
                        ok: false,
                        msg: 'El usuario ingresado no es un id de mongo valido'
                    })
                }

                if (!total) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'El monto Total es obligatorio'
                    });
                }

                if (!subTotal) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'El monto SubTotal es obligatorio'
                    });
                }

                if (descuento) {
                    if (!cuponId) {
                        return res.status(400).json({
                            ok: false,
                            msg: 'Si ingreso un descuento, tiene que ingresar el Id del Cupon tambien'
                        });
                    }
                }

                if (cuponId) {
                    if (!descuento) {
                        return res.status(400).json({
                            ok: false,
                            msg: 'Si ingreso el Id de un Cupon, debe ingresar el monto de descuento tambien'
                        });
                    }
                }


                // Crear Comprobante
                const data = {
                    numero: index,
                    detalleComprobante: detalleComprobanteId,
                    subTotal: subTotal,
                    descuento: descuento,
                    total: total,
                    usuario: usuario,
                    cupon: cuponId
                }

                const comprobante = new Comprobante(data);

                if (comprobante) {

                    //Descontar stock
                    let cantidadProductosArray = 0;
                    productos.forEach(element => {
                        cantidadProductosArray = cantidadProductosArray + 1;
                    });

                    for (let index = 1; index <= cantidadProductosArray; index++) {

                        let num = Number(index) - 1;
                        const producto = productos[num];

                        const prod = await Producto.findById(producto._id);
                        if (!prod) {
                            return res.status(400).json({
                                ok: false,
                                msg: 'No hay producto/s'
                            });
                        }

                        if (prod.stock > 0) {

                            if (prod.stock >= producto.cantidad) {

                                const stock = prod.stock - producto.cantidad;
                                producto.stock = stock;
                                producto.cantidad = 1;

                                await Producto.findByIdAndUpdate(producto._id, producto);

                            } else {
                                return res.status(400).json({
                                    ok: false,
                                    msg: 'No hay stock de la cantidad que desea comprar del producto',
                                    producto: producto.titulo
                                });
                            }

                        } else {
                            return res.status(400).json({
                                ok: false,
                                msg: `No hay stock del producto: ${producto.titulo}`
                            });
                        }


                    }

                    // Cupon Descuento
                    if (cuponId) {

                        const esMongoId = isValidObjectId(cuponId); // TRUE

                        if (esMongoId) {

                            const cuponDes = await CuponDescuento.findById(cuponId);
                            if (!cuponDes) {
                                return res.status(404).json({
                                    ok: false,
                                    msg: 'Error de Cupon - invalido o no existe'
                                });
                            }

                            // Descontar usos
                            let descontar = cuponDes.usos;
                            descontar = descontar - 1;

                            const dataCup = {
                                usos: descontar
                            }

                            await CuponDescuento.findByIdAndUpdate(cuponId, dataCup);

                        } else {
                            return res.status(400).json({
                                ok: false,
                                msg: 'El Cupon ingresado no es un id de mongo valido'
                            });
                        }

                    } else {
                        const data2 = {
                            cupon: null
                        }
                        await Comprobante.findByIdAndUpdate(comprobante._id, data2);
                    }

                    console.log(comprobante)
                    await comprobante.save();

                    return res.json({
                        ok: true,
                        msg: 'Comprobante creado correctamente',
                        comprobante
                    });

                } else {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error al crear el comprobante'
                    });
                }

            } else {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error - No hay productos en la peticion'
                });
            }

        }

    }







}


module.exports = {
    obtenerComprobantes,
    obtenerComprobantePorId,
    generarComprobante
}