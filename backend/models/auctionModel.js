const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const auctionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
            type: Boolean,
            required: false,
            default: false
        },
        enableViewerAnalytics: {
            type: Boolean,
            required: false,
            default: false,
            comment: 'Track viewer count every minute for analytics'
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

// Create compound unique index on name + organizer
// This ensures auction names are unique per organizer, not globally
auctionSchema.index({ name: 1, organizer: 1 }, { unique: true });

const auctionModels = mongoose.model("auctionModels", auctionSchema);

module.exports = auctionModels;