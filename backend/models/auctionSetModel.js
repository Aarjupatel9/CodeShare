const mongoose = require("mongoose");


const setSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            required: false,
        },
        state: {
            type: String,
            required: true,
            default: "idle"
        },
        auction: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'auctionModels',
        }
    },
    { timestamps: true }
);

setSchema.index({ auction: 1, name: 1 }, { unique: true })

const auctionSetModels = mongoose.model("auctionSetModels", setSchema);

module.exports = auctionSetModels;