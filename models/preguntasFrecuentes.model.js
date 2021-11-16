const { Schema, model } = require('mongoose');


const PreguntasFrecuentesSchema = Schema({

    pregunta: {
        type: String,
        require: [true, 'La pregunta es obligatoria']
    },
    respuesta: {
        type: String,
        require: [true, 'La respuesta es obligatoria']
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


PreguntasFrecuentesSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model( 'PreguntasFrecuentes', PreguntasFrecuentesSchema );