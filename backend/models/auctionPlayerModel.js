const mongoose = require("mongoose");


const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        playerNumber: {
            type: String,
            required: true,
        },

        contactNumber: {
            type: String,
            required: false,
        },
        shift: {
            type: String,
            required: false,
        },

        role: {
            type: String,
            required: true,
        },
        bowlingHand: {
            type: String,
            required: false,
        },
        bowlingType: {
            type: String,
            required: false,
        },
        battingHand: {
            type: String,
            required: false,
        },
        battingPossition: {
            type: String,
            required: false,
        },
        battingType: {
            type: String,
            required: false,
        },
        teamCode: {
            type: String,
            required: false,
            default:""
        },
        team: {
            type: mongoose.SchemaTypes.ObjectId,
            required: false,
            ref: 'auctionModels',
            default: null
        },

        auction: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
            ref: 'auctionModels',
        },

        auctionSet: {
            type: mongoose.SchemaTypes.ObjectId,
            required: false,
            ref: 'auctionSetModels',
            default: null
        },
        marquee: {
            type: Boolean,
            required: false,
            default: false,
        },
        category: {
            type: String,
            required: false,
            default: "",
        },

        auctionStatus: {
            type: String,
            required: false,
            default: "idle"
        },
        basePrice: {
            type: Number,
            required: false,
            default: 0,
        },
        soldPrice: {
            type: Number,
            required: false,
            default:0
        },
        commnets:{
            type: String,
            required: false,
            default:""
        },
        bidding: [
            {
                team: {
                    type: mongoose.SchemaTypes.ObjectId,
                    required: true,
                    ref: 'auctionTeamModels'
                },
                price: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

playerSchema.index({ auction: 1, playerNumber: 1 }, { unique: true })
const auctionPlayerModels = mongoose.model("auctionPlayerModels", playerSchema);


module.exports = auctionPlayerModels;