const mongoose = require("mongoose");


const auctionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        organizer: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
            default: "setup"
        },
        budgetPerTeam: {
            type: Number,
            required: false,
            default:0
        },

    },
    { timestamps: true }
);

const auctionModels = mongoose.model("auctionModels", auctionSchema);

module.exports = auctionModels;