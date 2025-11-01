const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        // Admin role management
        role: {
            type: String,
            enum: ['user', 'moderator', 'admin'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        loginCount: {
            type: Number,
            default: 0,
        },
        // File upload settings per user
        fileUploadEnabled: {
            type: Boolean,
            default: false, // Default false for backward compatibility (undefined = false)
        },
        fileSizeLimit: {
            type: Number,
            default: 1 * 1024 * 1024, // Default 1MB in bytes
        },
        pages: [
            {
                pageId: {
                    type: mongoose.SchemaTypes.ObjectId,
                    required: true,
                    ref: 'dataModels'
                },
                right: {
                    type: String, // read, write, delete, owner
                    required: true,
                },
                order: {
                    type: Number,
                    default: 0,
                },
                isPinned: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    { timestamps: true }
);


const userModels = mongoose.model("userModals", userSchema);


module.exports = userModels;