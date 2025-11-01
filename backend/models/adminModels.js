const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        default: 'general',
        enum: ['general', 'feature', 'security', 'storage', 'email'],
    },
}, { timestamps: true });

const AdminSettings = mongoose.model("AdminSettings", adminSettingsSchema);

module.exports = AdminSettings;

