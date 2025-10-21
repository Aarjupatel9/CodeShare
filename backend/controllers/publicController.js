const imageService = require("../services/imageService");
const AuctionTeamModel = require("../models/auctionTeamModel");
const mongoose = require("mongoose");

/**
 * Get team logo (3-tier caching: Browser → Public Folder → MongoDB)
 * GET /api/public/team-logos/:teamId
 */
exports.getTeamLogo = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required",
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format",
      });
    }

    // Tier 2: Check public folder cache
    const cachedLogo = await imageService.getFromPublicFolder(teamId);
    
    if (cachedLogo) {
      // Serve from cache with browser caching headers
      res.set({
        'Content-Type': cachedLogo.mimeType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'ETag': `"${teamId}-${cachedLogo.size}"`,
      });
      
      return res.send(cachedLogo.buffer);
    }

    // Tier 3: Fetch from MongoDB and regenerate cache
    const team = await AuctionTeamModel.findById(teamId).select('logo');
    
    if (!team || !team.logo || !team.logo.data) {
      return res.status(404).json({
        success: false,
        message: "Team logo not found",
      });
    }

    // Convert base64 to buffer
    const buffer = imageService.base64ToBuffer(team.logo.data);

    // Save to public folder for next request
    await imageService.saveToPublicFolder(teamId, buffer);

    // Serve with caching headers
    res.set({
      'Content-Type': team.logo.mimeType || 'image/webp',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${teamId}-${team.logo.size}"`,
    });

    res.send(buffer);

  } catch (e) {
    console.error("Error in getTeamLogo:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

