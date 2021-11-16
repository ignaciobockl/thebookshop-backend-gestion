const { Schema, model } = require('mongoose');


const ProductoSchema = Schema({

    titulo: {
        type: String,
        require: [true, 'El título es obligatorio']
    },
    descripcion: {
        type: String
    },
    precio: {
        type: Number,
        min: 0,
        max: 999999
    },
    isbn: {
        type: Number
            // unique: true
    },
    formato: {
        type: String
    },
    img: {
        type: String
    },
    editorial: {
        type: Schema.Types.ObjectId,
        ref: 'Editorial'
    },
    autor: {
        type: Schema.Types.ObjectId,
        ref: 'Autor'
    },
    subCategoria: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategoria'
    },
    idioma: {
        type: String
    },
    edicion: {
        type: String
    },
    anoPublicacion: {
        type: Date
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
        max: 999999
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    cantidad: {
        type: Number,
        default: 1
    },
    vendidos: {
        type: Number,
        default: 0
    }


});


ProductoSchema.methods.toJSON = function() {

    const { __v, estado, ...object } = this.toObject();
    return object;

}


module.exports = model('Producto', ProductoSchema);