const express = require("express");
const multer = require('multer');
const router = express.Router({ mergeParams: true }); // mergeParams to access :auctionId
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const { 
    getTeams,
    createTeam, 
    updateTeam,
    deleteTeam,
    uploadTeamLogo
} = require("../../controllers/v1/auctionTeamController");

// Memory storage for team logos (no AWS S3)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 } // 500KB max upload size
});

// All routes require authentication
router.use(authenticateUser());
router.use(authenticateAuction());

// Team CRUD
router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", deleteTeam);

// Team logo (uses memory storage, not S3)
router.post("/:teamId/logo", upload.single("file"), uploadTeamLogo);

module.exports = router;

