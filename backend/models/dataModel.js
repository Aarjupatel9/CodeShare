const mongoose = require('mongoose');

const dataModelsSchema = mongoose.Schema({
   
    unique_name: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: false
    },
    language: {
        type: String,
        required: false
    },
});

const dataModels = mongoose.model('dataModels', dataModelsSchema);

module.exports = dataModels;