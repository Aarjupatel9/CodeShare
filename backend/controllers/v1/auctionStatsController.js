const mongoose = require('mongoose');
const AuctionModel = require("../../models/auctionModel");
const AuctionTeamModel = require("../../models/auctionTeamModel");
const AuctionPlayerModel = require("../../models/auctionPlayerModel");
const AuctionSetModel = require("../../models/auctionSetModel");
const ViewerAnalytics = require("../../models/viewerAnalyticsModel");

/**
 * Get auction statistics for authenticated user
 * GET /api/v1/auctions/stats
 */
exports.getAuctionStats = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get all user's auctions
    const auctions = await AuctionModel.find({ 
      organizer: user._id.toString()
    }).select('state');

    // Calculate stats
    const stats = {
      total: auctions.length,
      active: auctions.filter(a => a.state === 'running').length,
      completed: auctions.filter(a => a.state === 'completed').length,
      setup: auctions.filter(a => a.state === 'setup').length,
    };

    res.status(200).json({
      success: true,
      message: "Auction statistics retrieved successfully",
      data: stats,
    });
  } catch (e) {
    console.error("Error in getAuctionStats:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get detailed summary for a single auction
 * GET /api/v1/auctions/:id/summary
 */
exports.getAuctionSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get auction
    const auction = await AuctionModel.findById(id).select('-password');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Verify ownership
    if (auction.organizer !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get counts using aggregation for better performance
    const [teamStats, playerStats, setStats] = await Promise.all([
      // Team stats
      AuctionTeamModel.aggregate([
        { $match: { auction: auction._id } },
        { 
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalBudget: { $sum: { $toDouble: "$budget" } },
            totalRemaining: { $sum: { $toDouble: "$remainingBudget" } }
          }
        }
      ]),
      
      // Player stats
      AuctionPlayerModel.aggregate([
        { $match: { auction: auction._id } },
        {
          $group: {
            _id: "$auctionStatus",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Set stats
      AuctionSetModel.aggregate([
        { $match: { auction: auction._id } },
        {
          $group: {
            _id: "$state",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Process player stats
    const playerStatusMap = {};
    playerStats.forEach(item => {
      playerStatusMap[item._id] = item.count;
    });

    const totalPlayers = playerStats.reduce((sum, item) => sum + item.count, 0);
    const soldPlayers = playerStatusMap['sold'] || 0;
    const unsoldPlayers = playerStatusMap['unsold'] || 0;
    const pendingPlayers = totalPlayers - soldPlayers - unsoldPlayers;

    // Process set stats
    const setStatusMap = {};
    setStats.forEach(item => {
      setStatusMap[item._id] = item.count;
    });

    const totalSets = setStats.reduce((sum, item) => sum + item.count, 0);

    // Build summary response
    const summary = {
      auction: {
        _id: auction._id,
        name: auction.name,
        state: auction.state,
        budgetPerTeam: auction.budgetPerTeam,
        maxTeamMember: auction.maxTeamMember,
        minTeamMember: auction.minTeamMember,
        auctionLiveEnabled: auction.auctionLiveEnabled,
      },
      stats: {
        teams: {
          total: teamStats[0]?.total || 0,
          totalBudget: teamStats[0]?.totalBudget || 0,
          totalRemaining: teamStats[0]?.totalRemaining || 0,
          totalSpent: (teamStats[0]?.totalBudget || 0) - (teamStats[0]?.totalRemaining || 0)
        },
        players: {
          total: totalPlayers,
          sold: soldPlayers,
          unsold: unsoldPlayers,
          pending: pendingPlayers
        },
        sets: {
          total: totalSets,
          active: setStatusMap['active'] || setStatusMap['running'] || 0,
          completed: setStatusMap['completed'] || 0,
          pending: setStatusMap['pending'] || setStatusMap['setup'] || 0
        }
      }
    };

    res.status(200).json({
      success: true,
      message: "Auction summary retrieved successfully",
      data: summary,
    });
  } catch (e) {
    console.error("Error in getAuctionSummary:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get recent sold players for an auction (public)
 * GET /api/v1/auctions/:id/recent-sold?limit=10
 */
exports.getRecentSoldPlayers = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Get recently sold players (middleware already checked if live view is enabled)
    const recentSold = await AuctionPlayerModel.find({ 
      auction: id,
      auctionStatus: 'sold'
    })
      .populate('team', 'name logo')
      .sort({ soldNumber: -1 })
      .limit(limit)
      .select('playerNumber name soldPrice team soldNumber');

    res.status(200).json({
      success: true,
      message: "Recent sold players retrieved successfully",
      data: recentSold,
    });
  } catch (e) {
    console.error("Error in getRecentSoldPlayers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get team leaderboard for an auction (public)
 * GET /api/v1/auctions/:id/leaderboard
 */
exports.getAuctionLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get teams with player counts and budget info (middleware already checked if live view is enabled)
    const teams = await AuctionTeamModel.find({ auction: id });
    
    // Get player counts per team
    const playerCounts = await AuctionPlayerModel.aggregate([
      { $match: { auction: new mongoose.Types.ObjectId(id), auctionStatus: 'sold' } },
      { 
        $group: {
          _id: "$team",
          playerCount: { $sum: 1 },
          totalSpent: { $sum: { $toDouble: "$soldPrice" } }
        }
      }
    ]);

    // Build leaderboard
    const leaderboard = teams.map(team => {
      const stats = playerCounts.find(pc => pc._id?.toString() === team._id.toString());
      
      return {
        _id: team._id,
        name: team.name,
        logo: team.logo,
        owner: team.owner,
        budget: parseFloat(team.budget) || 0,
        remainingBudget: parseFloat(team.remainingBudget) || 0,
        budgetSpent: stats?.totalSpent || 0,
        playerCount: stats?.playerCount || 0,
        budgetUsedPercent: team.budget > 0 ? Math.round(((stats?.totalSpent || 0) / parseFloat(team.budget)) * 100) : 0
      };
    });

    // Sort by budget spent (descending)
    leaderboard.sort((a, b) => b.budgetSpent - a.budgetSpent);

    res.status(200).json({
      success: true,
      message: "Leaderboard retrieved successfully",
      data: leaderboard,
    });
  } catch (e) {
    console.error("Error in getAuctionLeaderboard:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Save viewer analytics snapshot (called by socket server)
 * POST /api/v1/auctions/:id/analytics/snapshot
 */
exports.saveViewerSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, viewerCount, avgViewers, peakViewers, minViewers, sampleCount } = req.body;
    
    // Verify internal request (security - called from socket server)
    const internalKey = req.headers['x-internal-request'];
    if (internalKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Invalid internal API key'
      });
    }
    
    // Check if analytics is enabled for this auction
    const auction = await AuctionModel.findById(id).select('enableViewerAnalytics').lean();
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    // Only save if analytics enabled
    if (!auction.enableViewerAnalytics) {
      return res.status(200).json({
        success: true,
        message: 'Analytics disabled for this auction - snapshot not saved'
      });
    }
    
    // Save snapshot
    await ViewerAnalytics.create({
      auction: id,
      timestamp: timestamp || new Date(),
      viewerCount: viewerCount || 0,
      avgViewers: avgViewers || viewerCount || 0,
      peakViewers: peakViewers || viewerCount || 0,
      minViewers: minViewers || viewerCount || 0,
      sampleCount: sampleCount || 1
    });
    
    console.log(`✅ Viewer snapshot saved: Auction ${id}, ${viewerCount} viewers (avg: ${avgViewers}, peak: ${peakViewers})`);
    
    res.status(200).json({
      success: true,
      message: 'Snapshot saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving viewer snapshot:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

/**
 * Get viewer analytics for an auction
 * GET /api/v1/auctions/:id/analytics/viewers
 */
exports.getViewerAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange } = req.query; // 'hour', 'day', 'all'
    
    // Build query based on time range
    let query = { auction: id };
    
    if (timeRange === 'hour') {
      query.timestamp = { $gte: new Date(Date.now() - 3600000) };
    } else if (timeRange === 'day') {
      query.timestamp = { $gte: new Date(Date.now() - 86400000) };
    }
    
    // Get snapshots
    const snapshots = await ViewerAnalytics.find(query)
      .select('timestamp viewerCount avgViewers peakViewers minViewers sampleCount')
      .sort({ timestamp: 1 })
      .lean();
    
    // Calculate summary stats
    // let summary = {
    //   totalSnapshots: snapshots.length,
    //   overallPeak: 0,
    //   overallAvg: 0,
    //   overallMin: Infinity,
    //   duration: 0
    // };
    
    // if (snapshots.length > 0) {
    //   summary.overallPeak = Math.max(...snapshots.map(s => s.peakViewers || s.viewerCount));
    //   summary.overallMin = Math.min(...snapshots.map(s => s.minViewers || s.viewerCount));
    //   summary.overallAvg = Math.round(
    //     snapshots.reduce((sum, s) => sum + (s.avgViewers || s.viewerCount), 0) / snapshots.length
    //   );
      
    //   // Calculate duration
    //   const firstSnapshot = new Date(snapshots[0].timestamp);
    //   const lastSnapshot = new Date(snapshots[snapshots.length - 1].timestamp);
    //   summary.duration = Math.round((lastSnapshot - firstSnapshot) / 60000); // minutes
    // }
    
    res.status(200).json({
      success: true,
      message: "Viewer analytics retrieved successfully",
      data: {
        snapshots,
        // summary
      }
    });
    
  } catch (error) {
    console.error('Error in getViewerAnalytics:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

