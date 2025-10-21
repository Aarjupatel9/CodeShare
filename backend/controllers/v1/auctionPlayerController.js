const AuctionPlayerModel = require("../../models/auctionPlayerModel");
const AuctionSetModel = require("../../models/auctionSetModel");
const AuctionTeamModel = require("../../models/auctionTeamModel");
const AuctionModel = require("../../models/auctionModel");

const playerDataMapping = {
  "PLAYER NO.": "playerNumber",
  "PLAYER NAME": "name",
  "CONTACT NO.": "contactNumber",
  "SHIFT": "shift",
  "ROLE": "role",
  "BOWLING ARM": "bowlingHand",
  "BOWLING TYPE": "bowlingType",
  "BATTING HAND": "battingHand",
  "BATTING ORDER": "battingPossition",
  "BATTING STYLE": "battingType",
  "BASE PRICE": "basePrice",
  "COMMENTS": "commnets",
  "CATEGORY": "category",
  "PLAYER'S CRICHEROES ACCOUNT": "applicationLink",
  "BU": "businessUnit",
  "PREFFERED SET": "auctionSet",
};

/**
 * Get all players for an auction
 * GET /api/v1/auctions/:auctionId/players
 */
exports.getPlayers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { status, setId, teamId } = req.query;

    const filter = { auction: auctionId };

    if (status) {
      filter.auctionStatus = status;
    }
    if (setId) {
      filter.auctionSet = setId;
    }
    if (teamId) {
      filter.team = teamId;
    }

    const players = await AuctionPlayerModel.find(filter)
      .populate('team', 'name logo')
      .populate('auctionSet', 'name state')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Players retrieved successfully",
      data: players,
    });
  } catch (e) {
    console.error("Error in getPlayers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Create players (batch)
 * POST /api/v1/auctions/:auctionId/players
 */
exports.createPlayers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { players } = req.body;

    if (!Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Players array is required",
      });
    }

    const auction = await AuctionModel.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    const createdPlayers = [];
    const errors = [];

    for (const playerData of players) {
      try {
        const newPlayer = new AuctionPlayerModel({
          ...playerData,
          auction: auctionId,
        });

        const savedPlayer = await newPlayer.save();
        createdPlayers.push(savedPlayer);
      } catch (err) {
        errors.push({
          player: playerData,
          error: err.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdPlayers.length} player(s) created successfully`,
      data: createdPlayers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    console.error("Error in createPlayers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Update players (batch)
 * PUT /api/v1/auctions/:auctionId/players
 */
exports.updatePlayers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { players } = req.body;

    if (!Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Players array is required",
      });
    }

    const updatedPlayers = [];
    const errors = [];

    for (const playerData of players) {
      try {
        if (!playerData._id) {
          errors.push({
            player: playerData,
            error: "Player ID is required for update",
          });
          continue;
        }

        const updatedPlayer = await AuctionPlayerModel.findOneAndUpdate(
          { _id: playerData._id, auction: auctionId },
          { $set: playerData },
          { new: true, runValidators: true }
        );

        if (updatedPlayer) {
          updatedPlayers.push(updatedPlayer);

          // Update team budget if player has team
          if (playerData.team) {
            await updateRemainingBudget(playerData.team);
          }
        } else {
          errors.push({
            player: playerData,
            error: "Player not found",
          });
        }
      } catch (err) {
        errors.push({
          player: playerData,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `${updatedPlayers.length} player(s) updated successfully`,
      data: updatedPlayers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    console.error("Error in updatePlayers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Delete players (batch)
 * DELETE /api/v1/auctions/:auctionId/players
 */
exports.deletePlayers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { playerIds } = req.body;

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Player IDs array is required",
      });
    }

    const result = await AuctionPlayerModel.deleteMany({
      _id: { $in: playerIds },
      auction: auctionId,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} player(s) deleted successfully`,
    });
  } catch (e) {
    console.error("Error in deletePlayers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Import players from Excel data
 * POST /api/v1/auctions/:auctionId/players/import
 */
exports.importPlayers = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { playerData } = req.body;

    if (!playerData || !Array.isArray(playerData.main) || playerData.main.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid player data format",
      });
    }

    const auction = await AuctionModel.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    const imported = [];
    const skipped = [];

    for (let i = 0; i < playerData.main.length; i++) {
      const player = playerData.main[i];

      if (i % 10 === 0) {
        console.info(`Importing players... ${i}/${playerData.main.length}`);
      }

      try {
        // Check if player already exists
        const existingPlayer = await AuctionPlayerModel.findOne({
          playerNumber: player["PLAYER NO."],
          auction: auctionId,
        });

        if (existingPlayer) {
          skipped.push({
            playerNumber: player["PLAYER NO."],
            name: player["PLAYER NAME"],
            reason: "Already exists",
          });
          continue;
        }

        // Get or create set
        let playerSet = null;
        if (player["PREFFERED SET"]) {
          playerSet = await getOrCreateSet(player["PREFFERED SET"], auction);
        }

        // Map and create player
        const mappedPlayer = await createPlayerFromImport(player, auction, playerSet);
        imported.push(mappedPlayer);
      } catch (err) {
        console.error(`Error importing player ${player["PLAYER NAME"]}:`, err);
        skipped.push({
          playerNumber: player["PLAYER NO."],
          name: player["PLAYER NAME"],
          reason: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import completed. ${imported.length} players imported, ${skipped.length} skipped`,
      data: {
        imported: imported.length,
        skipped,
      },
    });
  } catch (e) {
    console.error("Error in importPlayers:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

// Helper functions

async function updateRemainingBudget(teamId) {
  try {
    const teamPlayers = await AuctionPlayerModel.find({ team: teamId });
    
    let spentBudget = 0;
    teamPlayers.forEach((player) => {
      spentBudget += player.soldPrice || 0;
    });

    const team = await AuctionTeamModel.findById(teamId);
    
    if (team) {
      const remainingBudget = team.budget - spentBudget;
      await AuctionTeamModel.updateOne(
        { _id: teamId },
        { remainingBudget }
      );
    }
  } catch (err) {
    console.error("Error updating remaining budget:", err);
  }
}

async function getOrCreateSet(setName, auction) {
  try {
    let set = await AuctionSetModel.findOne({
      name: setName,
      auction: auction._id,
    });

    if (!set) {
      set = new AuctionSetModel({
        name: setName,
        auction: auction._id,
        state: "idle",
      });
      await set.save();
    }

    return set;
  } catch (err) {
    console.error("Error in getOrCreateSet:", err);
    return null;
  }
}

async function createPlayerFromImport(data, auction, set) {
  const mappedData = {};

  // Map Excel columns to schema fields
  Object.keys(data).forEach((key) => {
    if (playerDataMapping[key]) {
      mappedData[playerDataMapping[key]] = data[key];
    }
  });

  mappedData.auction = auction._id;
  mappedData.auctionSet = set ? set._id : null;
  mappedData.marquee = false;

  // Convert base price (assuming it's in lakhs)
  if (mappedData.basePrice) {
    try {
      mappedData.basePrice = parseInt(mappedData.basePrice) * 100000;
    } catch (err) {
      console.error("Error parsing base price:", err);
    }
  }

  const newPlayer = new AuctionPlayerModel(mappedData);
  return await newPlayer.save();
}

