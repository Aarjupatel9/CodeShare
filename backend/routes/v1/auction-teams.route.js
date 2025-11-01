const express = require("express");
const multer = require('multer');
const router = express.Router({ mergeParams: true }); // mergeParams to access :auctionId
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const activityLogger = require('../../middleware/activityLogger');
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
router.get("/", activityLogger('team_get', 'auction'), getTeams);
router.post("/", activityLogger('team_create', 'auction'), createTeam);
router.put("/:teamId", activityLogger('team_update', 'auction'), updateTeam);
router.delete("/:teamId", activityLogger('team_delete', 'auction'), deleteTeam);

// Team logo (uses memory storage, not S3)
router.post("/:teamId/logo", upload.single("file"), activityLogger('team_logo_upload', 'auction'), uploadTeamLogo);

module.exports = router;

