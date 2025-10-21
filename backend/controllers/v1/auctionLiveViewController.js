const mongoose = require('mongoose');
const AuctionModel = require('../../models/auctionModel');
const AuctionTeamModel = require('../../models/auctionTeamModel');
const AuctionPlayerModel = require('../../models/auctionPlayerModel');

/**
 * Middleware to check if auction live view is enabled
 * Checks req.params.id for auction ID
 */
exports.checkLiveViewEnabled = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const auction = await AuctionModel.findById(id).select('auctionLiveEnabled');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }
    
    if (!auction.auctionLiveEnabled) {
      return res.status(403).json({
        success: false,
        message: "Live view is not enabled for this auction. Please contact the auction organizer."
      });
    }
    
    next();
  } catch (error) {
    console.error("Error in checkLiveViewEnabled:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

/**
 * Get all live view data in a single optimized API call
 * Combines auction info, teams, leaderboard, recent sales, stats, and team-player mapping
 */
exports.getLiveViewData = async (req, res) => {
  try {
    
    const { id } = req.params;
    
    // Parallel queries for better performance
    const [auction, teams, soldPlayers] = await Promise.all([
      // 1. Get auction (minimal fields)
      AuctionModel.findById(id)
        .select('_id name state createdAt')
        .lean(),
      
      // 2. Get teams (minimal fields)
      AuctionTeamModel.find({ auction: id })
        .select('_id name logoUrl budget')
        .lean(),
      
      // 3. Get sold players only (for live view, we only care about sold players)
      AuctionPlayerModel.find({ auction: id })
        .select('_id name playerNumber role soldPrice soldNumber team auctionStatus')
        .sort({ soldNumber: -1 })
        .lean()
    ]);
    
    // Return raw data - let frontend do the processing
    // This saves server CPU and memory
    res.status(200).json({
      success: true,
      message: "Live view data retrieved successfully",
      data: {
        auction,
        teams,
        soldPlayers // Frontend will process this to build leaderboard, recent sales, team-player mapping
      }
    });
    
  } catch (error) {
    console.error("Error in getLiveViewData:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

