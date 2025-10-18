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
            data: {
                type: String,  // base64 encoded image
                required: false,
            },
            mimeType: {
                type: String,  // image/webp, image/jpeg, image/png
                required: false,
            },
            filename: {
                type: String,  // original filename
                required: false,
            },
            size: {
                type: Number,  // file size in bytes
                required: false,
            },
            publicPath: {
                type: String,  // public URL path
                required: false,
            },
            uploadedAt: {
                type: Date,
                required: false,
            }
        }
    },
    { timestamps: true }
);
teamSchema.index({ auction: 1, name: 1 }, { unique: true })

const auctionTeamModels = mongoose.model("auctionTeamModels", teamSchema);


module.exports = auctionTeamModels;