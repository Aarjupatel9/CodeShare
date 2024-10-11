const mongoose = require("mongoose");
const dataModelsSchema = mongoose.Schema({
    unique_name: {
        type: String,
        required: true,
        index: true,
    },
    data: {
        type: String,
        required: false,
    },
    dataVersion: [
        {
            time: {
                type: Date,
                required: true,
            },
            data: {
                type: String,
                required:false,
            },
            user:{
                type:mongoose.SchemaTypes.ObjectId,
                required:false,
            }
        },
    ],
    files: [
        {
            name: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            key: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            others: {
                type: Object,
                required: false,
            },
        },
    ],
    language: {
        type: String,
        required: false,
    },


    // access: {
    //   type: mongoose.Schema.Types.Mixed,
    //   validate: {
    //     validator: function (v) {
    //       // Check if v is a string (public or private)
    //       if (typeof v === "string") {
    //         return v === "public" || v === "private";
    //       } else if (Array.isArray(v)) {
    //         return v.every((item) => item === mongoose.SchemaTypes.ObjectId);
    //       }
    //       return false; // Invalid type
    //     },
    //     message: (props) =>
    //       `${props.value} is not a valid access type! It should be "public", "private", or an array of those.`,
    //   },
    // },/
    access: {
        type: String,
        required: true,
    },
    sharedAccess: [
        {
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                required: true,
                ref: 'userModels',
            },
            right: {
                type: String, // read, write, delete, owner
                required: true,
            },
        },
    ],
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userModels',
        required: false,
    },
});


const dataModels = mongoose.model("dataModels", dataModelsSchema);


module.exports = dataModels;