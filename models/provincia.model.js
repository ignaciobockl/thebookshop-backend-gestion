const { Schema, model } = require('mongoose');

const ProvinciaSchema = Schema({
    provincia: {
        type: String,
    }
});

module.exports = model( 'Province', ProvinciaSchema );