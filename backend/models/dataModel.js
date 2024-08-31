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
    dataVersion: [
        {
            time: {
                type: Date,
                required: true,
            },
            data: {
                type: String,
                required: true,
            },
        }
    ],
    files: [
        {
            name: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }, key: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            others: {
                type : Object,
                required:false, 
            }
        }
    ],
    language: {
        type: String,
        required: false
    },
});

const dataModels = mongoose.model('dataModels', dataModelsSchema);

module.exports = dataModels;