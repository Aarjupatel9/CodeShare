const AuctionSetModel = require("../../models/auctionSetModel");
const AuctionPlayerModel = require("../../models/auctionPlayerModel");
const AuctionModel = require("../../models/auctionModel");

/**
 * Get all sets for an auction
 * GET /api/v1/auctions/:auctionId/sets
 */
exports.getSets = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const sets = await AuctionSetModel.find({ auction: auctionId })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Sets retrieved successfully",
      data: sets,
    });
  } catch (e) {
    console.error("Error in getSets:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Create set
 * POST /api/v1/auctions/:auctionId/sets
 */
exports.createSet = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { name, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Set name is required",
      });
    }

    const auction = await AuctionModel.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Check if set name already exists
    const existingSet = await AuctionSetModel.findOne({
      name,
      auction: auctionId,
    });

    if (existingSet) {
      return res.status(409).json({
        success: false,
        message: `Set '${name}' already exists in this auction`,
      });
    }

    const newSet = new AuctionSetModel({
      name,
      order,
      auction: auctionId,
      state: "idle",
    });

    const savedSet = await newSet.save();

    res.status(201).json({
      success: true,
      message: "Set created successfully",
      data: savedSet,
    });
  } catch (e) {
    console.error("Error in createSet:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Update set
 * PUT /api/v1/auctions/:auctionId/sets/:setId
 */
exports.updateSet = async (req, res) => {
  try {
    const { auctionId, setId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData._id;
    delete updateData.auction;

    const updatedSet = await AuctionSetModel.findOneAndUpdate(
      { _id: setId, auction: auctionId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSet) {
      return res.status(404).json({
        success: false,
        message: "Set not found",
      });
    }

    // Check if all sets are completed and create "unsold" set if needed
    if (updateData.state === "completed") {
      await checkAndCreateUnsoldSet(auctionId);
    }

    res.status(200).json({
      success: true,
      message: "Set updated successfully",
      data: updatedSet,
    });
  } catch (e) {
    console.error("Error in updateSet:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Delete set
 * DELETE /api/v1/auctions/:auctionId/sets/:setId
 */
exports.deleteSet = async (req, res) => {
  try {
    const { auctionId, setId } = req.params;

    // Check if set has players
    const playersInSet = await AuctionPlayerModel.findOne({ auctionSet: setId });

    if (playersInSet) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete set with assigned players. Remove players from this set first.",
      });
    }

    const deletedSet = await AuctionSetModel.findOneAndDelete({
      _id: setId,
      auction: auctionId,
    });

    if (!deletedSet) {
      return res.status(404).json({
        success: false,
        message: "Set not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Set deleted successfully",
    });
  } catch (e) {
    console.error("Error in deleteSet:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

// Helper function
async function checkAndCreateUnsoldSet(auctionId) {
  try {
    const sets = await AuctionSetModel.find({ auction: auctionId });

    // Check if all sets (except "unsold") are completed
    const allCompleted = sets.every(
      (set) => set.state === "completed" || set.name === "unsold"
    );

    if (allCompleted) {
      // Check if "unsold" set already exists
      const unsoldSet = await AuctionSetModel.findOne({
        name: "unsold",
        auction: auctionId,
      });

      if (!unsoldSet) {
        console.info("Creating 'unsold' set");

        const newUnsoldSet = new AuctionSetModel({
          name: "unsold",
          auction: auctionId,
          state: "idle",
        });

        await newUnsoldSet.save();

        // Move unsold players to this set
        await AuctionPlayerModel.updateMany(
          { auctionStatus: "unsold", auction: auctionId },
          { auctionStatus: "idle", auctionSet: newUnsoldSet._id }
        );
      }
    }
  } catch (err) {
    console.error("Error in checkAndCreateUnsoldSet:", err);
  }
}

