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
            default: ""
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
            default: "idle",
            enum: ['idle', 'bidding', 'sold', 'unsold'],
            default: 'idle'
        },
        soldNumber: { type: Number, required: false, default: 0 },
        basePrice: {
            type: Number,
            required: false,
            default: 0,
        },
        soldPrice: {
            type: Number,
            required: false,
            default: 0
        },
        commnets: {
            type: String,
            required: false,
            default: ""
        },
        applicationLink: {
            type: String,
            required: false,
            default: ""
        },
        businessUnit: {
            type: String,
            required: false,
            default: ""
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



// Pre 'save' Middleware for Direct Saves
playerSchema.pre('save', async function (next) {
    console.log("running pre save function ")

    if (!this.isModified('auctionStatus')) {
        return next();
    }

    if (this.auctionStatus === 'sold' && this.soldNumber === null) {
        const maxSoldNumberPlayer = await this.constructor.findOne({ auctionStatus: 'sold' })
            .sort('-soldNumber')
            .select('soldNumber')
            .lean();

        const maxSoldNumber = maxSoldNumberPlayer ? maxSoldNumberPlayer.soldNumber : 0;
        this.soldNumber = maxSoldNumber + 1;
    }

    next();
});

// Pre 'findOneAndUpdate' Middleware for Update Methods
playerSchema.pre('findOneAndUpdate', async function (next) {
    console.log("running pre find and update function ")

    const update = this.getUpdate();

    // Check if auctionStatus is being updated to 'sold'
    if (update.$set?.auctionStatus === 'sold') {
        const docToUpdate = await this.model.findOne(this.getQuery()); // Get the original document
        if (!docToUpdate || docToUpdate.auctionStatus === 'sold') {
            return next(); // Skip if already sold
        }

        // Fetch the current maximum soldNumber
        const maxSoldNumberPlayer = await this.model.findOne({ auctionStatus: 'sold' })
            .sort('-soldNumber')
            .select('soldNumber')
            .lean();

        const maxSoldNumber = maxSoldNumberPlayer ? maxSoldNumberPlayer.soldNumber : 0;

        // Add the incremented soldNumber to the update query
        update.$set.soldNumber = maxSoldNumber + 1;
    }

    next();
});

// Pre 'updateOne' Middleware (Optional)
playerSchema.pre('updateOne', async function (next) {
    console.log("running pre updateOne function ")

    const update = this.getUpdate();
    const query = this.getQuery(); // Access the query filter

    console.log('running pre updateOne function Update Payload:', update); // Debugging
    console.log('running pre updateOne function Query Filter:', query);   // Debugging

    const docToUpdate = await this.model.findOne(query).lean();

    if (!docToUpdate) {
        const error = new Error('Player not found.');
        error.type = 'ValidationError';
        return next(error);
    }

    if (docToUpdate.auctionStatus === 'sold') {
        const error = new Error('Updates are not allowed on a player that is already sold.');
        error.type = 'ValidationError';
        return next(error);
    }

    // Check if auctionStatus is being updated to 'sold'
    console.log("running pre updateOne function auctionStatus", update.$set?.auctionStatus);
    if (update.$set?.auctionStatus === 'sold') {

        const maxSoldNumberPlayer = await this.model.findOne({
            auctionStatus: 'sold',
            auction: docToUpdate.auction
        })
            .sort('-soldNumber')
            .select('soldNumber')
            .lean();

        const maxSoldNumber = maxSoldNumberPlayer ? maxSoldNumberPlayer.soldNumber : 0;
        console.log("running pre updateOne function maxSoldNumber", maxSoldNumberPlayer.soldNumber);

        // Add the incremented soldNumber to the update query
        update.$set.soldNumber = maxSoldNumber + 1;
    }

    next();
});


playerSchema.index({ auction: 1, playerNumber: 1 }, { unique: true })
const auctionPlayerModels = mongoose.model("auctionPlayerModels", playerSchema);


module.exports = auctionPlayerModels;