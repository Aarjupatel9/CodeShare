const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModals",
            required: true,
            unique: true,
        },
        data: {
            type: Object,
            required: true,
        },
    },
    { timestamps: true }
);

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
