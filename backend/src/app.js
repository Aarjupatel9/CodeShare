const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
require("dotenv").config();
var bodyParser = require("body-parser");

// Legacy routes
const userRoute = require('../routes/userRoute');
const authRoute = require('../routes/authRoute');
const auctionRoute = require('../routes/auctionRoute');

// New API v1 routes
const v1Routes = require('../routes/v1');

// Services for logo sync
const imageService = require('../services/imageService');

const app = express();

let allowedOrigin = process.env.ALLOWED_ORIGIN;
allowedOrigin = allowedOrigin.split(",");
let hostOriginIp = process.env.HOST_ORIGIN_IP;

// Trust the reverse proxy (Nginx, etc.)
app.set('trust proxy', 'loopback, ' + hostOriginIp);

// const limiter = rateLimit({
//     windowMs: 5000, // 15 minutes
//     limit: 25, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//     standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
// })
// app.use(limiter)


app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

app.use(logger("dev")); // for logs
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', './views');
// app.use(bodyParser.json({ limit: "2000kb" }));
// app.use(bodyParser.urlencoded({ limit: "2000kb", extended: true }));


app.get('/', (req, res) => {
    res.status(200).json({
        message: "server is up and running 🛠",
        serverTime: new Date(Date.now()).toLocaleString("en-US", {
            hour: 'numeric',
            minute: 'numeric',
            second: "numeric",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    })
});


// Mount v1 API routes (new RESTful API)
app.use("/api/v1", v1Routes);

// Legacy routes (for backward compatibility)
app.use("/api/data", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/auction", auctionRoute);


app.get('*', (req, res) => {
    // Check if this is a team logo request
    if (req.path.startsWith('/uploads/teams/') && req.path.match(/\/uploads\/teams\/[a-fA-F0-9]+\.[a-zA-Z]+$/)) {
      const matches = req.path.match(/\/uploads\/teams\/([a-fA-F0-9]+)\.([a-zA-Z]+)$/);
      if (matches) {
        const teamId = matches[1];
        
        // Trigger background sync
        imageService.syncTeamLogoFromDB(teamId).catch(err => {
          console.error('Background logo sync error:', err.message);
        });
        
        return res.status(404).send('Logo not found');
      }
    }
    
    return res.status(404).json({ message: 'Content not found' });
})


app.use((err, req, res, next) => {
    console.error(err);
    
    // Handle Multer file upload errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false,
                message: 'File too large. Maximum upload size is 500KB' 
            });
        }
        return res.status(400).json({ 
            success: false,
            message: `Upload error: ${err.message}` 
        });
    }
    
    // Handle JSON syntax errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid JSON payload' 
        });
    }
    
    // Generic error handler
    return res.status(500).json({ 
        success: false,
        message: 'Internal Server Error' 
    });
});

module.exports = app;