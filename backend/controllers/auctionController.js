const AuctionModel = require("../models/auctionModel");
const AuctionTeamModel = require("../models/auctionTeamModel");
const AuctionPlayerModel = require("../models/auctionPlayerModel");
const AuctionSetModel = require("../models/auctionSetModel");
const FileModel = require("../models/fileModel");
const UserModel = require('../models/userModels');
const fs = require('fs');
const path = require('path');

const {
  genJWTToken,
  compareHashPassword,
  verifyJWTToken,
  generateHashPassword,
  sendEmail,
} = require("../services/authService");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

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
  // "SOLD PRICE": "soldPrice",
  // "TEAM NAME": "team",
  // "TEAM CODE": "teamCode",
  "COMMENTS": "commnets",
  "CATEGORY": "category",
  "PLAYER'S CRICHEROES ACCOUNT": "applicationLink",
  "BU": "businessUnit",
  "PREFFERED SET": "auctionSet",
}


exports.checkPublicAvailability = () => {
  return async (req, res, next) => {
    try {
      const { auctionId } = req.body;

      const auction = await AuctionModel.findOne({ _id: auctionId });
      if (!auction) {
        return res.status(400).json({ success: false, message: "Auction not found" });
      }

      if (!auction.auctionLiveEnabled) {
        return res.status(401).json({ success: false, message: "Please Contact auction organizer to enable public live link" });
      }

      next();
    } catch (error) {
      console.error(error);
      if (error.name == "TokenExpiredError") {
        return res.clearCookie("token").clearCookie("auction_token").status(401).json({ success: false, message: error.message });
      } else {
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  };
};

exports.auctionLogin = async function (req, res) {
  try {
    const { name, organizer, password } = req.body;
    const user = req.user;

    // For backward compatibility: accept organizer as string (username) or use authenticated user
    let query = { name: name };

    if (organizer) {
      // If organizer is provided as username, try to find by username first
      const organizerUser = await UserModel.findOne({ username: organizer });
      if (organizerUser) {
        query.organizer = organizerUser._id;
      } else {
        // Fallback: try as direct match (for old data)
        query.organizer = organizer;
      }
    } else if (user) {
      // Use authenticated user's ID
      query.organizer = user._id;
    }

    let auction = await AuctionModel.findOne(query);
    if (!auction) {
      return res
        .status(400)
        .json({ message: "Auction details invalid.", success: false });
    }

    // Compare password using model method
    const isPasswordValid = await auction.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid password.", success: false });
    }

    const payload = {
      _id: auction._id,
      organizer: auction.organizer,
    };

    const token = genJWTToken(payload);

    res.cookie("auction_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    auction.password = undefined;

    res
      .status(200)
      .json({
        message: "Successfully logged in to Auction - " + name,
        success: true,
        auction: auction,
      });

  } catch (e) {
    console.error("error", e);
    res
      .status(500)
      .json({
        message: "An error occurred during login" + e.toString(),
        success: false,
      });
  }
};

exports.auctionLogout = async function (req, res) {
  try {
    res.clearCookie("auction_token");
    res
      .status(200)
      .json({
        message: "Logged out from auction",
        success: true,
      });

  } catch (e) {
    console.error("error", e);
    res
      .status(500)
      .json({
        message: "Internal server error.",
        success: false,
      });
  }
};


exports.auctionDataImports = async function (req, res) {
  try {
    const { playerData, auction } = req.body;
    console.log("player data", playerData);
    console.log("playerData.main", playerData.main);
    if (typeof playerData.main != "object" || playerData.main.length < 1) {
      return res.status(200).json({
        success: false,
        message: "Invalid player data",
      });
    } else if (!auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "Invalid Auction ID",
      });
    }

    try {

      for (let j = 0; j < playerData.main.length; j++) {
        let player = playerData.main[j];
        if (j % 10 == 0) {
          console.info("Importing players..., current staus " + j + " ++");
        }

        let existing_player = await _lookUpPlayer(player["PLAYER No."], auction);
        if (!existing_player) {
          let playerPrefferedSet = await _createSet(player["PREFFERED SET"], auction, false);
          let newPlayer = await _createPlayer(player, auction, playerPrefferedSet)
        } else {
          console.debug("player already exist, not updating the player: " + player["PLAYER NAME"]);
        }
      }
    } catch (e) {
      console.error(e);
      return res.status(200).json({
        success: false,
        message: "Player import error: " + e.toString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Auction data imported",
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

async function _createTeam(teamName, auction) {
  let team = await AuctionTeamModel.findOne({ name: teamName, auction: auction._id });
  if (team) {
    return team;
  } else {
    let newAuctionTeam = new AuctionTeamModel({
      name: teamName,
      auction: auction._id,
      budget: auction.budgetPerTeam,
      remainingBudget: auction.budgetPerTeam
    })
    newAuctionTeam = await newAuctionTeam.save();
    return newAuctionTeam;
  }
}

async function _createSet(setName, auction, isMarquee) {
  let set = await AuctionSetModel.findOne({ name: setName, auction: auction._id });
  if (set) {
    return set;
  } else {
    let obj = {
      name: setName,
      auction: auction._id,
      state: "idle"
    }
    // if (isMarquee) {
    //   obj.state = "running";
    // }
    let newAuctionSet = new AuctionSetModel(obj);
    newAuctionSet = await newAuctionSet.save();
    return newAuctionSet;
  }
}

async function _createPlayer(data, auction, set) {
  let existing_player = await AuctionPlayerModel.findOne({ playerNumber: data["PLAYER No."], auction: auction._id });
  if (existing_player) {
    return existing_player;
  } else {
    let newData = {};
    Object.keys(data).forEach((key) => {
      newData[playerDataMapping[key]] = data[key];
    });
    newData.auctionSet = set._id;
    newData.auction = auction._id;
    newData.marquee = false;
    try {
      if (newData.basePrice) {
        newData.basePrice = parseInt(newData.basePrice) * 100000;
      }
      // if (newData.soldPrice) {
      //   newData.soldPrice = parseInt(newData.soldPrice) * 100000;
      // }

    } catch (e) {

    }
    // if (newData.team != "#N/A" && newData.soldPrice) {
    //   newData.team = await _getTeamId(newData.team, auction);
    //   newData.auctionStatus = "sold"
    //   newData.bidding = [{ team: newData.team, price: newData.soldPrice }];
    // }
    // if (newData.team == "#N/A") {
    //   newData.team = null;
    // }

    let newPlayer = new AuctionPlayerModel(newData)
    newPlayer = await newPlayer.save();
    return newPlayer;
  }
}

async function _getTeamId(teamName, auction) {
  let team = await AuctionTeamModel.findOne({ name: teamName, auction: auction._id });
  return team._id;
}
async function _getSetId(setName, auction) {
  let set = await AuctionSetModel.findOne({ name: setName, auction: auction._id });
  return set._id;
}


async function _lookUpPlayer(playerNumber, auction) {
  let player = await AuctionPlayerModel.findOne({ playerNumber: playerNumber, auction: auction._id });
  return player;
}


exports.createNewAuction = async function (req, res) {
  try {
    const { name, password } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if auction with same name exists for this organizer
    let auction = await AuctionModel.findOne({ name: name, organizer: user._id.toString() });
    if (auction) {
      return res.status(200).json({
        success: false,
        message: "You already have an auction with this name. Please choose a different name.",
      });
    } else {
      let newAuction = new AuctionModel({
        name: name,
        organizer: user._id.toString(), // Store as string
        password: password,
      })
      newAuction = await newAuction.save();
      res.status(200).json({
        success: true,
        message: "Auction is created ",
        result: newAuction,
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};
exports.updateNewAuction = async (req, res) => {
  try {
    const { auction } = req.body;
    if (!auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "Auction is required",
      });
    }

    let updatedPlayer = await AuctionModel.updateOne({ _id: auction._id }, auction, { upsert: false });
    if (updatedPlayer.matchedCount > 0 && auction.budgetPerTeam) {
      let teams = await AuctionTeamModel.find({ auction: auction._id });
      if (teams && teams.length > 0) {
        for (let t of teams) {
          let spent = t.budget - t.remainingBudget;
          let rm = auction.budgetPerTeam - spent;
          await AuctionTeamModel.updateOne({ _id: t._id }, { budget: auction.budgetPerTeam, remainingBudget: rm });
        }
      }
    }
    return res.status(200).json({
      success: true,
      message: "Auction Updated",
      auction: updatedPlayer
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};
exports.updateNewAuctionSet = async (req, res) => {
  try {
    const { set, auction } = req.body;
    if (!set || !set._id || !auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "Invalid payload",
      });
    }

    // First, set all currently running sets to idle (only ONE set can be running at a time)
    let updatedSet2 = await AuctionSetModel.updateMany(
      { auction: auction._id, state: "running" },
      { state: "idle" },
      { upsert: false }
    );

    // Then, update the selected set to the new state
    let updatedSet = await AuctionSetModel.updateOne({ _id: set._id }, set, { upsert: false });
    let sets = await AuctionSetModel.find({ auction: auction._id });

    if (sets && sets.length > 0) {
      let flag = true;
      for (let k = 0; k < sets.length; k++) {
        let s = sets[k];

        if (sets[k].state != "completed" || sets[k].name == "unsold") {
          flag = false;
          break;
        }
      }
      if (flag) {
        console.debug("creating unsold set");
        let unsoldSet = await _createSet("unsold", auction, false);
        // let unsoldPlayers = AuctionPlayerModel.find({ auctionStatus: "unsold", auction: auction._id });
        await AuctionPlayerModel.updateMany({ auctionStatus: "unsold", auction: auction._id }, { auctionStatus: "idle", auctionSet: unsoldSet._id })
      }
    }

    // Fetch full auction data (same as getAuctionDetails)
    let auctionData = await AuctionModel.findOne({ _id: auction._id });
    if (!auctionData) {
      return res.status(400).json({
        success: false,
        message: "Auction not found",
      });
    }

    let teams = await AuctionTeamModel.find({ auction: auction._id });
    let allPlayers = await AuctionPlayerModel.find({ auction: auction._id });
    let allSets = await AuctionSetModel.find({ auction: auction._id });
    
    // Remove password from auction object
    auctionData.password = undefined;

    // Find last sold/unsold player (most recent by updatedAt)
    let lastSoldPlayer = await AuctionPlayerModel.findOne({ 
      auction: auction._id, 
      auctionStatus: { $in: ["sold", "unsold"] } 
    }).sort({ updatedAt: -1 }).limit(1);

    return res.status(200).json({
      success: true,
      message: "Set is updated to " + set.state,
      auction: updatedSet, // Backward compatible
      auctionData: { // NEW: Full auction data
        auction: auctionData,
        teams: teams,
        players: allPlayers,
        sets: allSets,
        lastSoldPlayer: lastSoldPlayer || null
      }
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.createNewAuctionTeam = async (req, res) => {
  try {
    const { name, owner, auction } = req.body;
    if (!auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "auction id is required",
      });
    }
    let team = await AuctionTeamModel.findOne({ name: name, auction: auction._id });
    if (team) {
      return res.status(200).json({
        success: false,
        message: "Team with this name already present in current auction, please try with different name",
      });
    } else {
      let newAuctionTeam = new AuctionTeamModel({
        name: name,
        owner: owner,
        auction: auction._id,
        budget: auction.budgetPerTeam,
        remainingBudget: auction.budgetPerTeam
      })
      newAuctionTeam = await newAuctionTeam.save();
      res.status(200).json({
        success: true,
        message: "Team created",
        result: newAuctionTeam,
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.updateNewAuctionTeam = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team || !team._id) {
      return res.status(200).json({
        success: false,
        message: "Team ID is required",
      });
    }

    // Check if another team with the same name exists in the same auction
    const existingTeam = await AuctionTeamModel.findById(team._id);
    if (!existingTeam) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // If name is being changed, check for duplicates
    if (team.name && team.name !== existingTeam.name) {
      const duplicateTeam = await AuctionTeamModel.findOne({ 
        name: team.name, 
        auction: existingTeam.auction,
        _id: { $ne: team._id } 
      });
      
      if (duplicateTeam) {
        return res.status(200).json({
          success: false,
          message: "Team with this name already exists in this auction",
        });
      }
    }

    // Update team fields
    const updateData = {};
    if (team.name) updateData.name = team.name;
    if (team.owner !== undefined) updateData.owner = team.owner;
    if (team.budget) updateData.budget = team.budget;

    const updatedTeam = await AuctionTeamModel.findByIdAndUpdate(
      team._id, 
      updateData, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      result: updatedTeam,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.removeNewAuctionTeam = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team || !team._id) {
      return res.status(200).json({
        success: false,
        message: "auction id is required",
      });
    }
    let players = await AuctionPlayerModel.findOne({ team: team._id });
    if (players) {
      return res.status(200).json({
        success: false,
        message: "Team has player assigned, please remove them first",
      });
    } else {
      let t = await AuctionTeamModel.deleteOne({ _id: team._id });
      return res.status(200).json({
        success: true,
        message: "Team removed",
        result: t,
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.createNewAuctionSet = async (req, res) => {
  try {
    const { name, auction } = req.body;
    if (!auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "auction id is required",
      });
    }
    let set = await AuctionSetModel.findOne({ name: name, auction: auction._id });
    if (set) {
      return res.status(200).json({
        success: false,
        message: "Set with name '" + name + "' already present in current auction, please try with different name",
      });
    } else {

      let newAuctionSet = new AuctionSetModel({
        name: name,
        auction: auction._id,
      })

      newAuctionSet = await newAuctionSet.save();
      res.status(200).json({
        success: true,
        message: "Set created",
        result: newAuctionSet,
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.removeNewAuctionSet = async (req, res) => {
  try {
    const { set } = req.body;
    if (!set || !set._id) {
      return res.status(200).json({
        success: false,
        message: "Set id is required",
      });
    }
    let existing_player_with_set = await AuctionPlayerModel.findOne({ auctionSet: set._id });
    if (existing_player_with_set) {
      return res.status(200).json({
        success: false,
        message: "Set with this name already have player assigned, please try after remove all players from set",
      });
    } else {

      const delete_set = await AuctionSetModel.deleteOne({ _id: set._id })

      res.status(200).json({
        success: true,
        message: "Set deleted",
        result: delete_set,
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};



exports.createNewAuctionPlayer = async (req, res) => {
  try {
    const { players, auction } = req.body;
    if (!auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "auction id is required",
      });
    }
    let existing_auction = await AuctionModel.findOne({ _id: auction._id });
    if (existing_auction) {
      players.forEach(async (player) => {
        try {
          let newPlayer = new AuctionPlayerModel({
            auction: auction._id,
            ...player
          })
          newPlayer = await newPlayer.save();
        } catch (err) {
          console.error(err);
        }
      });

      return res.status(200).json({
        success: true,
        message: "All players added",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Auction ID is not valid",
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};
exports.updateNewAuctionPlayer = async (req, res) => {
  try {
    const { players } = req.body;
    if (!players || players.length < 1) {
      return res.status(200).json({
        success: false,
        message: "Player is required",
      });
    }

    // Get auctionId from the first player to fetch full auction data
    const firstPlayer = await AuctionPlayerModel.findById(players[0]._id);
    if (!firstPlayer) {
      return res.status(400).json({
        success: false,
        message: "Player not found",
      });
    }
    const auctionId = firstPlayer.auction;

    // Update players
    for (let i = 0; i < players.length; i++) {
      let player = players[i];
      try {
        let updatedPlayer = await AuctionPlayerModel.updateOne({ _id: player._id }, { $set: player }, { upsert: false });
        if (player.team) {
          await _updateRemainingBudget(player.team);
        }
      } catch (error) {
        console.error(error);
        if (error.type === 'ValidationError') {
          console.error('Validation Error:', error);
          return res.status(400).json({ success: false, message: error.message });
        } else {
          res.status(500).json({
            success: false,
            message: "internal server error : " + error,
          });
        }
      }
    }

    let auction = await AuctionModel.findOne({ _id: auctionId });
    if (auction) {
      let teams = await AuctionTeamModel.find({ auction: auctionId });
      let players = await AuctionPlayerModel.find({ auction: auctionId });
      let sets = await AuctionSetModel.find({ auction: auctionId });
      auction.password = undefined;

      // Find last sold/unsold player (most recent by updatedAt)
      let lastSoldPlayer = await AuctionPlayerModel.findOne({ 
        auction: auctionId, 
        auctionStatus: { $in: ["sold", "unsold"] } 
      }).sort({ updatedAt: -1 }).limit(1);
      
      // Fetch full auction data (same as getAuctionDetails)
      return res.status(200).json({
        success: true,
        message: "Player Updated",
        result: players, // Backward compatible - return updated players
        auctionData: { // NEW: Full auction data
          auction: auction,
          teams: teams,
          players: players,
          sets: sets,
          lastSoldPlayer: lastSoldPlayer || null
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Auction details not found",
      });
    }

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

async function _updateRemainingBudget(teamId) {
  let teamPlayers = await AuctionPlayerModel.find({ team: teamId });
  let spentBudget = 0;
  teamPlayers.forEach(element => {
    spentBudget += element.soldPrice;
  });
  const team = await AuctionTeamModel.findOne({ _id: teamId });
  if (team) {
    let remainingBudget = team.budget - spentBudget;
    await AuctionTeamModel.updateOne({ _id: teamId }, { remainingBudget: remainingBudget }, { upsert: false });
  }
}

exports.removeNewAuctionPlayer = async (req, res) => {
  try {
    const { players } = req.body;
    if (!players || players.length < 1) {
      return res.status(200).json({
        success: false,
        message: "Player is required",
      });
    }


    players.forEach(async (player) => {
      let existing_player = await AuctionPlayerModel.deleteOne({ _id: player._id });
    });

    return res.status(200).json({
      success: true,
      message: "All selected players removed",
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.getAuctionDetails = async (req, res) => {
  try {
    const { auctionId } = req.body;
    if (!auctionId) {
      return res.status(200).json({
        success: false,
        message: "auction id is required",
      });
    }
    let auction = await AuctionModel.findOne({ _id: auctionId });
    if (auction) {
      let teams = await AuctionTeamModel.find({ auction: auctionId });
      let players = await AuctionPlayerModel.find({ auction: auctionId });
      let sets = await AuctionSetModel.find({ auction: auctionId });
      auction.password = undefined;
      
      // Find last sold/unsold player (most recent by updatedAt)
      let lastSoldPlayer = await AuctionPlayerModel.findOne({ 
        auction: auctionId, 
        auctionStatus: { $in: ["sold", "unsold"] } 
      }).sort({ updatedAt: -1 }).limit(1);
      
      return res.status(200).json({
        success: true,
        message: "Action details available",
        auction: auction,
        teams: teams,
        players: players,
        sets: sets,
        lastSoldPlayer: lastSoldPlayer || null
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Wrong auction id",
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};


exports.saveTeamLogo = async (req, res, next) => {
  try {
    const { teamId, imageData, fileName, mimeType, fileSize } = req.body;
    
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required",
      });
    }

    if (!imageData || !fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        message: "Image data, file name, and mime type are required",
      });
    }

    // Verify team exists
    const team = await AuctionTeamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Remove data URL prefix if present (data:image/png;base64,...)
    let base64Data = imageData;
    if (imageData.includes('base64,')) {
      base64Data = imageData.split('base64,')[1];
    }

    // Determine file extension from mimeType
    const ext = mimeType.split('/')[1] || 'png';
    const newFileName = `${teamId}.${ext}`;
    
    // Define upload directory and file path
    const uploadDir = path.join(__dirname, '../public/uploads/teams');
    const filePath = path.join(uploadDir, newFileName);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Delete old logo files for this team (different extensions)
    const existingFiles = fs.readdirSync(uploadDir).filter(file => file.startsWith(teamId + '.'));
    existingFiles.forEach(file => {
      const oldFilePath = path.join(uploadDir, file);
      try {
        fs.unlinkSync(oldFilePath);
      } catch (err) {
        console.error(`Error deleting old logo file: ${err.message}`);
      }
    });

    // Write new file to disk
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    // Generate public URL
    const logoUrl = `/uploads/teams/${newFileName}`;

    // Create or update file record in File model (as backup)
    let fileRecord = await FileModel.findOne({ 
      entityType: 'team', 
      entityId: teamId,
      fileType: 'image'
    });

    if (fileRecord) {
      // Update existing file
      fileRecord.name = newFileName;
      fileRecord.originalName = fileName;
      fileRecord.mimeType = mimeType;
      fileRecord.size = fileSize || buffer.length;
      fileRecord.data = base64Data;
      fileRecord = await fileRecord.save();
    } else {
      // Create new file
      fileRecord = new FileModel({
        name: newFileName,
        originalName: fileName,
        mimeType: mimeType,
        size: fileSize || buffer.length,
        data: base64Data,
        entityType: 'team',
        entityId: teamId,
        fileType: 'image',
        uploadedBy: req.user?._id,
      });
      fileRecord = await fileRecord.save();
    }

    // Update team with logo URL
    await AuctionTeamModel.updateOne(
      { _id: teamId },
      { $set: { logoUrl: logoUrl } },
      { upsert: false }
    );

    res.status(200).json({
      success: true,
      message: "Logo successfully uploaded",
      result: {
        logoUrl: logoUrl,
        fileId: fileRecord._id,
      },
    });
  } catch (err) {
    console.error(`Internal server error: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${err}`,
    });
  }
};