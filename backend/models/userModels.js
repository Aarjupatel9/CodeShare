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
            select: false, // Don't return in queries by default
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
            select: false, // Don't return in queries by default
        },
        loginCount: {
            type: Number,
            default: 0, 
            select: false, // Don't return in queries by default
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
        // Google Drive OAuth tokens (encrypted)
        googleDriveAccessToken: {
            type: String,
            required: false,
            select: false, // Don't return in queries by default
        },
        googleDriveRefreshToken: {
            type: String,
            required: false,
            select: false, // Don't return in queries by default
        },
        googleDriveTokenExpiry: {
            type: Date,
            required: false,
            select: false, // Don't return in queries by default
        },
        googleDriveConnected: {
            type: Boolean,
            default: false,
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
       
        fileUploadFolder: {
            type: String,
            default: "CodeShare-Uploads",
        },
    },
    { timestamps: true }
);


const userModels = mongoose.model("userModals", userSchema);


module.exports = userModels;