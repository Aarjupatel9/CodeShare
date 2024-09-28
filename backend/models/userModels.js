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
            },
        ],
    },
    { timestamps: true }
);


const userModels = mongoose.model("userModals", userSchema);


module.exports = userModels;