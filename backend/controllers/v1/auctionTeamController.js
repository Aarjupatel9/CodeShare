const AuctionTeamModel = require("../../models/auctionTeamModel");
const AuctionPlayerModel = require("../../models/auctionPlayerModel");
const AuctionModel = require("../../models/auctionModel");
const imageService = require("../../services/imageService");

/**
 * Get all teams for an auction
 * GET /api/v1/auctions/:auctionId/teams
 * Query params: ?include=stats (optional)
 */
exports.getTeams = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const includeStats = req.query.include === 'stats';

    const teams = await AuctionTeamModel.find({ auction: auctionId })
      .sort({ createdAt: -1 });

    // If stats requested, add player counts and budget details
    if (includeStats) {
      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          const players = await AuctionPlayerModel.find({ 
            auction: auctionId,
            team: team._id 
          });

          const playerCount = players.length;
          const soldPlayers = players.filter(p => p.auctionStatus === 'sold');
          const budgetSpent = soldPlayers.reduce((sum, p) => sum + (parseFloat(p.soldPrice) || 0), 0);
          const budgetRemaining = parseFloat(team.budget) - budgetSpent;
          const budgetUsedPercent = team.budget > 0 ? Math.round((budgetSpent / parseFloat(team.budget)) * 100) : 0;

          return {
            ...team.toObject(),
            stats: {
              playerCount,
              soldCount: soldPlayers.length,
              budgetSpent,
              budgetRemaining,
              budgetUsedPercent
            }
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Teams with stats retrieved successfully",
        data: teamsWithStats,
      });
    }

    res.status(200).json({
      success: true,
      message: "Teams retrieved successfully",
      data: teams,
    });
  } catch (e) {
    console.error("Error in getTeams:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Create team
 * POST /api/v1/auctions/:auctionId/teams
 */
exports.createTeam = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { name, owner } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Get auction to retrieve budget
    const auction = await AuctionModel.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Check if team name already exists
    const existingTeam = await AuctionTeamModel.findOne({
      name,
      auction: auctionId,
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: "Team with this name already exists in this auction",
      });
    }

    const newTeam = new AuctionTeamModel({
      name,
      owner,
      auction: auctionId,
      budget: auction.budgetPerTeam || 0,
      remainingBudget: auction.budgetPerTeam || 0,
    });

    const savedTeam = await newTeam.save();

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: savedTeam,
    });
  } catch (e) {
    console.error("Error in createTeam:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Update team
 * PUT /api/v1/auctions/:auctionId/teams/:teamId
 */
exports.updateTeam = async (req, res) => {
  try {
    const { auctionId, teamId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData._id;
    delete updateData.auction;

    const updatedTeam = await AuctionTeamModel.findOneAndUpdate(
      { _id: teamId, auction: auctionId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (e) {
    console.error("Error in updateTeam:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Delete team
 * DELETE /api/v1/auctions/:auctionId/teams/:teamId
 */
exports.deleteTeam = async (req, res) => {
  try {
    const { auctionId, teamId } = req.params;

    // Check if team has players
    const playersWithTeam = await AuctionPlayerModel.findOne({ team: teamId });

    if (playersWithTeam) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete team with assigned players. Remove players first.",
      });
    }

    const deletedTeam = await AuctionTeamModel.findOneAndDelete({
      _id: teamId,
      auction: auctionId,
    });

    if (!deletedTeam) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (e) {
    console.error("Error in deleteTeam:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Upload team logo (MongoDB + Public Folder Caching)
 * POST /api/v1/auctions/:auctionId/teams/:teamId/logo
 */
exports.uploadTeamLogo = async (req, res) => {
  try {
    const { auctionId, teamId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file size (50KB max before optimization)
    const MAX_UPLOAD_SIZE = 500 * 1024; // 500KB max upload (will be optimized to <50KB)
    if (req.file.size > MAX_UPLOAD_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File too large. Max upload size is 500KB (will be optimized to <50KB)`,
      });
    }

    // Process and optimize the image
    const processedImage = await imageService.processTeamLogo(
      req.file.buffer,
      req.file.originalname
    );

    // Save to public folder for fast serving
    const publicFile = await imageService.saveToPublicFolder(
      teamId,
      processedImage.buffer
    );

    // Convert to base64 for MongoDB storage
    const base64Image = imageService.bufferToBase64(
      processedImage.buffer,
      processedImage.mimeType
    );

    // Create logo object for database
    const logoObject = {
      data: base64Image,
      mimeType: processedImage.mimeType,
      filename: req.file.originalname,
      size: processedImage.size,
      publicPath: publicFile.publicPath,
      uploadedAt: new Date(),
    };

    // Update team in database
    const updatedTeam = await AuctionTeamModel.findOneAndUpdate(
      { _id: teamId, auction: auctionId },
      { logo: logoObject },
      { new: true }
    );

    if (!updatedTeam) {
      // Clean up cached file if team not found
      await imageService.deleteFromPublicFolder(teamId);
      
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team logo uploaded successfully",
      data: {
        publicPath: publicFile.publicPath,
        size: processedImage.size,
        mimeType: processedImage.mimeType,
        optimized: processedImage.optimized,
      },
    });
  } catch (e) {
    console.error("Error in uploadTeamLogo:", e);
    res.status(500).json({
      success: false,
      message: e.message || "Internal server error",
    });
  }
};

