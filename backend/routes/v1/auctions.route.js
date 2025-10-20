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

const {
    getAuctionStats,
    getAuctionSummary,
    getRecentSoldPlayers,
    getAuctionLeaderboard
} = require("../../controllers/v1/auctionStatsController");

// Public auction routes
router.get("/public/:id", getPublicAuction);
router.get("/:id/recent-sold", getRecentSoldPlayers);
router.get("/:id/leaderboard", getAuctionLeaderboard);

// Protected routes - require user authentication
router.use(authenticateUser());

// Auction stats
router.get("/stats", getAuctionStats);

// Auction CRUD
router.get("/", getAuctions);
router.post("/", createAuction);
router.get("/:id", authenticateAuction(), getAuction);
router.put("/:id", authenticateAuction(), updateAuction);
router.delete("/:id", authenticateAuction(), deleteAuction);

// Auction summary
router.get("/:id/summary", getAuctionSummary);

// Auction session management
router.post("/:id/login", loginAuction);
router.post("/:id/logout", logoutAuction);

module.exports = router;

