const { Schema, model } = require('mongoose');


const AutorSchema = Schema({

    nombre: {
        type: String,
        require: [true, 'El nombre es obligatorio']
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


AutorSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model( 'Autor', AutorSchema );