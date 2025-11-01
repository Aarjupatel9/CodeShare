const mongoose = require("mongoose");
const dataModelsSchema = mongoose.Schema({
    unique_name: {
        type: String,
        required: true,
        index: true,
    },
    data: {
        type: String,
        required: false,
    },
    dataVersion: [
        {
            time: {
                type: Date,
                required: true,
            },
            data: {
                type: String,
                required: false,
            },
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                required: false,
            }
        },
    ],
    language: {
        type: String,
        required: false,
    },
    access: {
        type: String,
        required: true,
    },
    sharedAccess: [
        {
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                required: true,
                ref: 'userModals',
            },
            right: {
                type: String, // read, write, delete, owner
                required: true,
            },
        },
    ],
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userModals',
        required: false,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
}, { timestamps: true });


const dataModels = mongoose.model("dataModels", dataModelsSchema);


module.exports = dataModels;