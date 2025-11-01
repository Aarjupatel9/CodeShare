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
    files: [
        {
            name: {
                type: String,
                required: true,
            },
            // Storage method: 'google_drive' (primary), 'mongodb' (for future)
            storageMethod: {
                type: String,
                enum: ['google_drive', 'mongodb'],
                default: 'google_drive',
            },
            // S3 fields (backward compatibility - optional to support existing files)
            url: {
                type: String,
                required: false, // Optional for backward compatibility
            },
            key: {
                type: String,
                required: false, // Optional for backward compatibility
            },
            // Google Drive fields
            googleDriveFileId: {
                type: String,
                required: function() { return this.storageMethod === 'google_drive'; }
            },
            downloadUrl: {
                type: String,
                required: false, // Optional, can be used for Google Drive
            },
            // MongoDB GridFS fields (for future)
            gridfsId: {
                type: mongoose.SchemaTypes.ObjectId,
                required: function() { return this.storageMethod === 'mongodb'; }
            },
            // Common fields
            type: {
                type: String,
                required: true,
            },
            size: {
                type: Number,
                required: false, // Optional for backward compatibility
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
            others: {
                type: Object,
                required: false,
            },
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
                ref: 'userModels',
            },
            right: {
                type: String, // read, write, delete, owner
                required: true,
            },
        },
    ],
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userModels',
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