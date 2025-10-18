const express = require("express");
const router = express.Router();
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const { 
    getAuctions,
    getAuction,
    createAuction, 
    updateAuction, 
    deleteAuction,
    loginAuction,
    logoutAuction,
    getPublicAuction
} = require("../../controllers/v1/auctionController");

// Public auction routes
router.get("/public/:id", getPublicAuction);

// Protected routes - require user authentication
router.use(authenticateUser());

// Auction CRUD
router.get("/", getAuctions);
router.post("/", createAuction);
router.get("/:id", authenticateAuction(), getAuction);
router.put("/:id", authenticateAuction(), updateAuction);
router.delete("/:id", authenticateAuction(), deleteAuction);

// Auction session management
router.post("/:id/login", loginAuction);
router.post("/:id/logout", logoutAuction);

module.exports = router;

