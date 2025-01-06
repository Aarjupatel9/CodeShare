require("dotenv").config();
require('./DB/conn');
const app = require("./src/app");

const PORT = process.env.PORT || 8080;

app.listen(PORT, (err) => {
    if (err) {
        console.error("Error occurred while starting the server..." + err);
        return
    }
    console.info(`server started on PORT --> ${PORT}`);
})

