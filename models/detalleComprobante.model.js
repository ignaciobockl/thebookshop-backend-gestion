const { Schema, model } = require('mongoose');


const DetalleComprobanteSchema = Schema({

    productos: {
        type: Array
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    // usuario: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Usuario',
    //     required: true
    // },
});


DetalleComprobanteSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model( 'DetalleComprobante', DetalleComprobanteSchema );