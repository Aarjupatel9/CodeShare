const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
            default: 0
        },
        maxTeamMember: {
            type: Number,
            required: false,
            default: 0
        },
        minTeamMember: {
            type: Number,
            required: false,
            default: 0
        },
        auctionLiveEnabled: {
            type: Number,
            required: false,
            default: false
        }
    },
    { timestamps: true }
);

// Hash password before saving
auctionSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
auctionSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const auctionModels = mongoose.model("auctionModels", auctionSchema);

module.exports = auctionModels;