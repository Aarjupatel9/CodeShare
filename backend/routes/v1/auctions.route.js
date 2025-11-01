const express = require("express");
const router = express.Router();
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const activityLogger = require('../../middleware/activityLogger');
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
    getAuctionLeaderboard,
    saveViewerSnapshot,
    getViewerAnalytics
} = require("../../controllers/v1/auctionStatsController");

const {
    getLiveViewData,
    checkLiveViewEnabled
} = require("../../controllers/v1/auctionLiveViewController");



// Public live view route (unified API for live view page)
router.get("/:id/live-data", checkLiveViewEnabled, getLiveViewData);

// Internal route (called by socket server - requires internal API key)
router.post("/:id/analytics/snapshot", saveViewerSnapshot);

// Protected routes - require user authentication
router.use(authenticateUser());

// Auction stats (protected)
router.get("/stats", activityLogger('auction_stats', 'auction'), getAuctionStats);

// Live view related APIs for admin/dashboard (protected, require live view enabled)
router.get("/:id/recent-sold", activityLogger('auction_live_view', 'auction'), getRecentSoldPlayers);
router.get("/:id/leaderboard", activityLogger('auction_live_view', 'auction'), getAuctionLeaderboard);

// Auction CRUD
router.get("/", activityLogger('auction_get', 'auction'), getAuctions);
router.post("/", activityLogger('auction_create', 'auction'), createAuction);
router.get("/:id", authenticateAuction(), activityLogger('auction_get', 'auction'), getAuction);
router.put("/:id", authenticateAuction(), activityLogger('auction_update', 'auction'), updateAuction);
router.delete("/:id", authenticateAuction(), activityLogger('auction_delete', 'auction'), deleteAuction);

// Auction summary
router.get("/:id/summary", activityLogger('auction_summary', 'auction'), getAuctionSummary);

// Viewer analytics
router.get("/:id/analytics/viewers", activityLogger('auction_analytics', 'auction'), getViewerAnalytics);

// Auction session management
router.post("/:id/login", activityLogger('auction_login', 'auction'), loginAuction);
router.post("/:id/logout", activityLogger('auction_logout', 'auction'), logoutAuction);

module.exports = router;

