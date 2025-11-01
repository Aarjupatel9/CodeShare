const AuctionPlayerModel = require("../../models/auctionPlayerModel");
const AuctionSetModel = require("../../models/auctionSetModel");
const AuctionTeamModel = require("../../models/auctionTeamModel");
const AuctionModel = require("../../models/auctionModel");
const XLSX = require('xlsx');
const logger = require("../../utils/loggerUtility");

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
    logger.logError(e, req, {
      controller: 'auctionPlayerController',
      function: 'getPlayers',
      resourceType: 'auction',
      resourceId: auctionId,
      context: { userId: req?.user?._id }
    });
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
    logger.logError(e, req, {
      controller: 'auctionPlayerController',
      function: 'createPlayers',
      resourceType: 'auction',
      resourceId: auctionId,
      context: { userId: req?.user?._id }
    });
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
    logger.logError(e, req, {
      controller: 'auctionPlayerController',
      function: 'updatePlayers',
      resourceType: 'auction',
      resourceId: auctionId,
      context: { userId: req?.user?._id }
    });
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
    logger.logError(e, req, {
      controller: 'auctionPlayerController',
      function: 'deletePlayers',
      resourceType: 'auction',
      resourceId: auctionId,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Import players from Excel data (OPTIMIZED - Bulk Operations)
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

   
    // STEP 1: Bulk check for existing players (single query)
    const playerNumbers = playerData.main.map(p => p["PLAYER NO."]).filter(num => num);
    const existingPlayers = await AuctionPlayerModel.find({
      playerNumber: { $in: playerNumbers },
      auction: auctionId,
    }).select('playerNumber').lean();

    const existingPlayerNumbers = new Set(existingPlayers.map(p => p.playerNumber));

    // STEP 2: Bulk get/create sets (single query + bulk create)
    const setNames = [...new Set(playerData.main.map(p => p["PREFFERED SET"]).filter(name => name && name !== '-'))];
    const existingSets = await AuctionSetModel.find({
      name: { $in: setNames },
      auction: auctionId,
    }).lean();

    const existingSetMap = new Map(existingSets.map(s => [s.name, s._id]));
    const setsToCreate = setNames.filter(name => !existingSetMap.has(name));

    // Bulk create missing sets
    if (setsToCreate.length > 0) {
      const newSets = await AuctionSetModel.insertMany(
        setsToCreate.map(name => ({
          name,
          auction: auctionId,
          state: "idle",
        }))
      );
      newSets.forEach(set => existingSetMap.set(set.name, set._id));
    }

    // STEP 3: Prepare players for bulk insert
    const playersToInsert = [];
    const skipped = [];

    for (const player of playerData.main) {
      try {
        // Validate required fields
        if (!player["PLAYER NO."] || !player["PLAYER NAME"] || !player["ROLE"]) {
          skipped.push({
            playerNumber: player["PLAYER NO."] || 'N/A',
            name: player["PLAYER NAME"] || 'N/A',
            reason: "Missing required fields (PLAYER NO., PLAYER NAME, or ROLE)",
          });
          continue;
        }

        // Skip if player already exists
        if (existingPlayerNumbers.has(player["PLAYER NO."])) {
          skipped.push({
            playerNumber: player["PLAYER NO."],
            name: player["PLAYER NAME"],
            reason: "Already exists",
          });
          continue;
        }

        // Map Excel data to player schema
        const mappedData = {};
        Object.keys(player).forEach((key) => {
          if (playerDataMapping[key]) {
            mappedData[playerDataMapping[key]] = player[key];
          }
        });

        // Ensure required fields are properly set
        mappedData.playerNumber = String(player["PLAYER NO."]); // Convert to string
        mappedData.name = String(player["PLAYER NAME"]).trim();
        mappedData.role = String(player["ROLE"]).trim();
        mappedData.auction = auctionId;
        
        // Handle auction set
        mappedData.auctionSet = player["PREFFERED SET"] && player["PREFFERED SET"] !== '-' 
          ? existingSetMap.get(player["PREFFERED SET"]) 
          : null;
        
        // Set defaults
        mappedData.marquee = false;
        mappedData.auctionStatus = 'idle'; // Changed from 'pending' to 'idle'
        mappedData.basePrice = 0; // Default base price

        // Convert base price (assuming it's in lakhs)
        if (player["BASE PRICE"]) {
          try {
            const basePriceValue = parseFloat(player["BASE PRICE"]);
            if (!isNaN(basePriceValue) && basePriceValue > 0) {
              mappedData.basePrice = Math.round(basePriceValue * 100000);
            }
          } catch (err) {
            console.error("Error parsing base price:", err);
            mappedData.basePrice = 0;
          }
        }

        // Handle optional fields with defaults
        mappedData.contactNumber = player["CONTACT NO."] && player["CONTACT NO."] !== '-' 
          ? String(player["CONTACT NO."]) 
          : "";
        mappedData.shift = player["SHIFT"] && player["SHIFT"] !== '-' 
          ? String(player["SHIFT"]) 
          : "";
        mappedData.bowlingHand = player["BOWLING ARM"] && player["BOWLING ARM"] !== '-' 
          ? String(player["BOWLING ARM"]) 
          : "";
        mappedData.bowlingType = player["BOWLING TYPE"] && player["BOWLING TYPE"] !== '-' 
          ? String(player["BOWLING TYPE"]) 
          : "";
        mappedData.battingHand = player["BATTING HAND"] && player["BATTING HAND"] !== '-' 
          ? String(player["BATTING HAND"]) 
          : "";
        mappedData.battingPossition = player["BATTING ORDER"] && player["BATTING ORDER"] !== '-' 
          ? String(player["BATTING ORDER"]) 
          : "";
        mappedData.battingType = player["BATTING STYLE"] && player["BATTING STYLE"] !== '-' 
          ? String(player["BATTING STYLE"]) 
          : "";
        mappedData.commnets = player["COMMENTS"] && player["COMMENTS"] !== '-' 
          ? String(player["COMMENTS"]) 
          : "";

        playersToInsert.push(mappedData);
      } catch (err) {
        console.error(`Error processing player ${player["PLAYER NAME"]}:`, err);
        skipped.push({
          playerNumber: player["PLAYER NO."] || 'N/A',
          name: player["PLAYER NAME"] || 'N/A',
          reason: err.message,
        });
      }
    }

    // STEP 4: Bulk insert all players (single operation)
    let insertedPlayers = [];
    if (playersToInsert.length > 0) {
      try {
        insertedPlayers = await AuctionPlayerModel.insertMany(playersToInsert, {
          ordered: false, // Continue inserting even if some fail
        });
      } catch (insertError) {
        console.error('Bulk insert error:', insertError);
        
        // If bulk insert fails, try individual inserts to identify specific issues
        for (const playerData of playersToInsert) {
          try {
            const player = new AuctionPlayerModel(playerData);
            const savedPlayer = await player.save();
            insertedPlayers.push(savedPlayer);
          } catch (individualError) {
            console.error(`Failed to insert player ${playerData.name}:`, individualError.message);
            skipped.push({
              playerNumber: playerData.playerNumber,
              name: playerData.name,
              reason: `Insert failed: ${individualError.message}`,
            });
          }
        }
      }
    }

    console.log(`Import completed: ${insertedPlayers.length} players imported, ${skipped.length} skipped`);

    res.status(200).json({
      success: true,
      message: `Import completed. ${insertedPlayers.length} players imported, ${skipped.length} skipped`,
      data: {
        imported: insertedPlayers.length,
        skipped,
      },
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'auctionPlayerController',
      function: 'importPlayers',
      resourceType: 'auction',
      resourceId: auctionId,
      context: { userId: req?.user?._id }
    });
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

/**
 * Generate Excel template for player uploads
 * GET /api/v1/auctions/:auctionId/players/template
 */
exports.generatePlayerTemplate = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    // Verify auction exists
    const auction = await AuctionModel.findById(auctionId).select('_id name').lean();
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Create workbook with two sheets
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Sample Data (ALL FIELDS REQUIRED with default values)
    const sampleData = [
      // Headers (UPPERCASE with dots/spaces)
      ['PLAYER NO.', 'PLAYER NAME', 'ROLE', 'BASE PRICE', 'PREFFERED SET', 
       'CONTACT NO.', 'SHIFT', 'BOWLING ARM', 'BOWLING TYPE', 
       'BATTING HAND', 'BATTING ORDER', 'BATTING STYLE', 'COMMENTS'],
      
      // Sample row with realistic cricket data
      [1, 'Virat Kohli', 'Batsman', 15, 'A', 
       '9876543210', 'Day', 'Right', 'Medium', 
       'Right', 'Top Order', 'Aggressive', 'Captain material'],
       
      [2, 'Jasprit Bumrah', 'Bowler', 12, 'A',
       '9876543211', 'Day', 'Right', 'Fast',
       'Right', 'Lower Order', 'Defensive', 'Death overs specialist'],
       
      [3, 'Hardik Pandya', 'All Rounder', 10, 'B',
       '9876543212', 'Day', 'Right', 'Medium',
       'Right', 'Middle Order', 'Aggressive', 'Power hitter'],
       
      // Empty template row with default values for admin to copy/fill
      ['', '', '', '', '', 
       '-', '-', '-', '-', 
       '-', '-', '-', '-']
    ];
    
    const sampleSheet = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Set column widths for better readability
    sampleSheet['!cols'] = [
      { wch: 12 }, // PLAYER NO.
      { wch: 20 }, // PLAYER NAME
      { wch: 15 }, // ROLE
      { wch: 12 }, // BASE PRICE
      { wch: 15 }, // PREFFERED SET
      { wch: 15 }, // CONTACT NO.
      { wch: 10 }, // SHIFT
      { wch: 12 }, // BOWLING ARM
      { wch: 15 }, // BOWLING TYPE
      { wch: 12 }, // BATTING HAND
      { wch: 15 }, // BATTING ORDER
      { wch: 15 }, // BATTING STYLE
      { wch: 25 }  // COMMENTS
    ];
    
    XLSX.utils.book_append_sheet(workbook, sampleSheet, 'main');
    
    // Sheet 2: Instructions with Default Values
    const instructions = [
      ['FIELD NAME', 'DESCRIPTION', 'REQUIRED', 'DEFAULT VALUE', 'EXAMPLE', 'NOTES'],
      ['PLAYER NO.', 'Unique number for player', 'YES', 'N/A', '1', 'Must be unique integer'],
      ['PLAYER NAME', 'Full name of player', 'YES', 'N/A', 'Virat Kohli', 'As per official records'],
      ['ROLE', 'Player role in team', 'YES', 'N/A', 'Batsman', 'Batsman/Bowler/All Rounder/Wicket Keeper'],
      ['BASE PRICE', 'Starting bid price in Lakhs', 'YES', 'N/A', '15', 'Will be multiplied by 100,000'],
      ['PREFFERED SET', 'Auction set preference', 'YES', '-', 'A', 'Use "-" if no preference'],
      ['CONTACT NO.', 'Player contact number', 'YES', '-', '9876543210', 'Use "-" if not available'],
      ['SHIFT', 'Preferred playing shift', 'YES', '-', 'Day', 'Day/Night or "-" if no preference'],
      ['BOWLING ARM', 'Bowling arm', 'YES', '-', 'Right', 'Left/Right or "-" if not applicable'],
      ['BOWLING TYPE', 'Type of bowling', 'YES', '-', 'Fast', 'Fast/Medium/Spin or "-" if not applicable'],
      ['BATTING HAND', 'Batting hand', 'YES', '-', 'Right', 'Left/Right or "-" if not applicable'],
      ['BATTING ORDER', 'Preferred batting position', 'YES', '-', 'Top Order', 'Top/Middle/Lower Order or "-"'],
      ['BATTING STYLE', 'Batting approach', 'YES', '-', 'Aggressive', 'Aggressive/Defensive or "-"'],
      ['COMMENTS', 'Additional notes', 'YES', '-', 'Captain material', 'Use "-" if no comments']
    ];
    
    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
    
    // Set column widths for instructions
    instructionSheet['!cols'] = [
      { wch: 15 }, // FIELD NAME
      { wch: 25 }, // DESCRIPTION
      { wch: 10 }, // REQUIRED
      { wch: 15 }, // DEFAULT VALUE
      { wch: 15 }, // EXAMPLE
      { wch: 30 }  // NOTES
    ];
    
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Player_Template_${auction.name.replace(/\s+/g, '_')}.xlsx"`);
    
    res.send(buffer);
    
  } catch (error) {
    logger.logError(error, req, {
      controller: 'auctionPlayerController',
      function: 'generateImportTemplate',
      resourceType: 'auction',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({ success: false, message: "Failed to generate template" });
  }
};

