const { Schema, model } = require('mongoose');


const CuponDescuentoSchema = Schema({

    nombre: {
        type: String,
        require: [true, 'El nombre es obligatorio']
    },
    codigo: {
        type: String,
    },
    usos: {
        type: Number,
        default: 1
    },
    valor: {
        type: Number
    },
    porcentaje: {
        type: Number
    },
    tipo: {
        type: String,
        required: true,
        default: 'VOUCHER',
        emun: ['GIFT_CARD', 'VOUCHER']
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
});


CuponDescuentoSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model( 'CuponDescuento', CuponDescuentoSchema );