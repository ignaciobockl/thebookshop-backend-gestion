const { Schema, model } = require('mongoose');


const SubCategoriaSchema = Schema({

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
    categoria: /*[*/{
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        require: [true, 'La categoria es obligatoria']
    }/*]*/,

});


SubCategoriaSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}

module.exports = model( 'SubCategoria', SubCategoriaSchema );