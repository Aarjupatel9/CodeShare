const app = require("./src/app");
require("dotenv").config();
require('./DB/conn');

const PORT = process.env.PORT || 8080;

app.listen(PORT, (err) => {
    if (err) {
        console.log("Error occurred while starting the server..." + err);
        return
    }
    console.log(`server started on PORT --> ${PORT}`);
})