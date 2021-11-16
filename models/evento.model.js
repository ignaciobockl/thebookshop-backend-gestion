const { Schema, model } = require('mongoose');


const EventoSchema = Schema({

    nombre: {
        type: String,
        require: [true, 'El nombre es obligatorio']
    },
    descripcion: {
        type: String
    },
    img: {
        type: String
    },
    lugar: {
        type: String
    },
    fechaHora: {
        type: Date
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


EventoSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model( 'Evento', EventoSchema );