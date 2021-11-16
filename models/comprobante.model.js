const { Schema, model } = require('mongoose');


const ComprobanteSchema = Schema({

    numero: {
        type: Number
    },
    fecha: {
        type: Date,
        default: Date.now()
    },
    detalleComprobante: {
        type: Schema.Types.ObjectId,
        ref: 'DetalleComprobante',
        required: true
    },
    subTotal: {
        type: Number
    },
    descuento: {
        type: Number
    },
    total: {
        type: Number
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        // required: true
    },
    cupon: {
        type: Schema.Types.ObjectId,
        ref: 'CuponDescuento'
    },
});


ComprobanteSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model('Comprobante', ComprobanteSchema);