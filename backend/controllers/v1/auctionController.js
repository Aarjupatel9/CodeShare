const AuctionModel = require("../../models/auctionModel");
const AuctionTeamModel = require("../../models/auctionTeamModel");
const AuctionPlayerModel = require("../../models/auctionPlayerModel");
const AuctionSetModel = require("../../models/auctionSetModel");
const { genJWTToken } = require("../../services/authService");

/**
 * Get all auctions for authenticated user
 * GET /api/v1/auctions
 */
exports.getAuctions = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find auctions by user ID (stored as string)
    const auctions = await AuctionModel.find({ 
      organizer: user._id.toString()
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Auctions retrieved successfully",
      data: auctions,
    });
  } catch (e) {
    console.error("Error in getAuctions:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get auction details by ID (requires auction auth)
 * GET /api/v1/auctions/:id
 */
exports.getAuction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auction = await AuctionModel.findById(id).select('-password');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    const teams = await AuctionTeamModel.find({ auction: id });
    const players = await AuctionPlayerModel.find({ auction: id });
    const sets = await AuctionSetModel.find({ auction: id });

    res.status(200).json({
      success: true,
      message: "Auction details retrieved successfully",
      data: {
        auction,
        teams,
        players,
        sets,
      },
    });
  } catch (e) {
    console.error("Error in getAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get public auction details
 * GET /api/v1/auctions/public/:id
 */
exports.getPublicAuction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auction = await AuctionModel.findById(id).select('-password');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (!auction.auctionLiveEnabled) {
      return res.status(403).json({
        success: false,
        message: "Public live view is not enabled for this auction",
      });
    }

    const teams = await AuctionTeamModel.find({ auction: id });
    const players = await AuctionPlayerModel.find({ auction: id });
    const sets = await AuctionSetModel.find({ auction: id });

    res.status(200).json({
      success: true,
      message: "Public auction details retrieved successfully",
      data: {
        auction,
        teams,
        players,
        sets,
      },
    });
  } catch (e) {
    console.error("Error in getPublicAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Create new auction
 * POST /api/v1/auctions
 */
exports.createAuction = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password are required",
      });
    }

    // Check if auction with same name exists for this organizer
    const existingAuction = await AuctionModel.findOne({ 
      name,
      organizer: user._id.toString()
    });

    if (existingAuction) {
      return res.status(409).json({
        success: false,
        message: "You already have an auction with this name. Please choose a different name.",
      });
    }

    const newAuction = new AuctionModel({
      name,
      organizer: user._id.toString(), // Store as string for consistency
      password, // Will be hashed by model pre-save hook
    });

    const savedAuction = await newAuction.save();
    savedAuction.password = undefined;

    res.status(201).json({
      success: true,
      message: "Auction created successfully",
      data: savedAuction,
    });
  } catch (e) {
    console.error("Error in createAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Update auction
 * PUT /api/v1/auctions/:id
 */
exports.updateAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields from update
    delete updateData._id;
    delete updateData.organizer;
    delete updateData.password;

    const updatedAuction = await AuctionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAuction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Update team budgets if budgetPerTeam changed
    if (updateData.budgetPerTeam) {
      const teams = await AuctionTeamModel.find({ auction: id });
      
      for (const team of teams) {
        const spent = team.budget - team.remainingBudget;
        const newRemaining = updateData.budgetPerTeam - spent;
        
        await AuctionTeamModel.updateOne(
          { _id: team._id },
          { budget: updateData.budgetPerTeam, remainingBudget: newRemaining }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Auction updated successfully",
      data: updatedAuction,
    });
  } catch (e) {
    console.error("Error in updateAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Delete auction
 * DELETE /api/v1/auctions/:id
 */
exports.deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const auction = await AuctionModel.findOne({ _id: id, organizer: user._id });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found or unauthorized",
      });
    }

    // Delete all related data
    await AuctionPlayerModel.deleteMany({ auction: id });
    await AuctionTeamModel.deleteMany({ auction: id });
    await AuctionSetModel.deleteMany({ auction: id });
    await AuctionModel.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Auction and all related data deleted successfully",
    });
  } catch (e) {
    console.error("Error in deleteAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Login to auction (create auction session)
 * POST /api/v1/auctions/:id/login
 */
exports.loginAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const user = req.user;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const auction = await AuctionModel.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Compare password (will use bcrypt when we implement hashing)
    const isPasswordValid = await auction.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Create auction session token
    const token = genJWTToken({
      _id: auction._id,
      organizer: auction.organizer,
    });

    res.cookie("auction_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    auction.password = undefined;

    res.status(200).json({
      success: true,
      message: "Logged in to auction successfully",
      data: auction,
    });
  } catch (e) {
    console.error("Error in loginAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Logout from auction
 * POST /api/v1/auctions/:id/logout
 */
exports.logoutAuction = async (req, res) => {
  try {
    res.clearCookie("auction_token");
    
    res.status(200).json({
      success: true,
      message: "Logged out from auction successfully",
    });
  } catch (e) {
    console.error("Error in logoutAuction:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

