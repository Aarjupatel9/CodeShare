const mongoose = require("mongoose");

const HOST = process.env.MONGODB_URI;

(async () => {
    try {
        await mongoose.connect(HOST, {
            dbName: "code_share",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
        });
        console.info(`Database service is up and running...`);
    } catch (error) {
        console.error("Failed to connect with database, error: ", error);
    }
})();

const conn = mongoose.connection;

module.exports = conn;
