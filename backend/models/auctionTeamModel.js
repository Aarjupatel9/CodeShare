const mongoose = require("mongoose");


const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: String,
            required: false,
        },
        auction: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'auctionModels',
        },
        budget: {
            type: Number,
            required: false,
            default: 0
        },
        remainingBudget: {
            type: Number,
            required: false,
            default: 0
        },
        logo: {
            type: Object,
            required: false,
        }
    },
    { timestamps: true }
);
teamSchema.index({ auction: 1, name: 1 }, { unique: true })

const auctionTeamModels = mongoose.model("auctionTeamModels", teamSchema);


module.exports = auctionTeamModels;