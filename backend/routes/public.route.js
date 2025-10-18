const express = require("express");
const router = express.Router();
const { getTeamLogo } = require("../controllers/publicController");

// Public routes (no authentication required)

// Get team logo with smart caching
router.get("/team-logos/:teamId", getTeamLogo);

module.exports = router;

