const AuctionModel = require("../models/auctionModel");
const AuctionTeamModel = require("../models/auctionTeamModel");
const AuctionPlayerModel = require("../models/auctionPlayerModel");
const AuctionSetModel = require("../models/auctionSetModel");

const uniEE = require("../emmiters/universal").uniEE;

const mongoose = require("mongoose");

var playerDataMapping = {
  "PLAYER No.": "playerNumber",
  "PLAYER NAME": "name",
  "CATEGORY": "AR1",
  "CONTACT NO.": "contactNumber",
  "SHIFT": "shift",
  "ROLE": "role",
  "BOWLING ARM": "bowlingHand",
  "BOWLING TYPE": "bowlingType",
  "BATTING HAND": "battingHand",
  "BATTING ORDER": "battingPossition",
  "BATTING STYLE": "battingType",
  "BASE PRICE": "basePrice",
  "SOLD PRICE": "soldPrice",
  "TEAM NAME": "team",
  "TEAM CODE": "teamCode",
  "COMMENTS": "commnets",
  "CATEGORY": "category"
}

exports.auctionDataImports = async function (req, res) {
  try {
    const { tabsData, auction } = req.body;

    if (typeof tabsData != "object" || tabsData.length < 1) {
      return res.status(200).json({
        success: false,
        message: "Invalid tabsData found",
      });
    } else if (!auction || !auction._id) {
      return res.status(200).json({
        success: false,
        message: "Invalid Auction ID",
      });
    }

    //creating team;
    var teams = [];
    try {
      var teamsData = tabsData[0].tabData; // 0 must be team list
      for (var i = 0; i < teamsData.length; i++) {
        var team = await _createTeam(teamsData[i], auction);
        if (team) {
          teams.push(team);
        } else {
          throw new Error("team create fails");
        }
      }
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        success: false,
        message: "Team create error: " + e.toString(),
      });
    }

    for (var i = 1; i < (tabsData.length - 1); i++) {
      console.log("processing for set ", i, tabsData[i].tabData.length);
      try {
        var tabData = tabsData[i];
        var newSet = await _createSet(tabData.tab, auction, false);
        var playerList = tabData.tabData;

        for (var j = 0; j < playerList.length; j++) {
          var playerData = playerList[j];
          var existing_player = await _lookUpPlayer(playerData["PLAYER No."], auction);

          if (!existing_player) {
            var newPlayer = await _createPlayer(playerData, auction, newSet)
          } else {
            console.log("player already exist, so not create");
          }
        }
      } catch (e) {
        console.log(e);
        return res.status(200).json({
          success: false,
          message: "Set create for " + i + ", error: " + e.toString(),
        });
      }
    }

    // for marquee set
    var tabData = tabsData[tabsData.length - 1];
    var newSet = await _createSet(tabData.tab, auction, true);
    // if (!newSet) {
    //   throw new Error("Set createion faild")
    // }
    var playerList = tabData.tabData;

    for (var i = 0; i < playerList.length; i++) {
      try {
        var playerData = playerList[i];
        var existing_player = await _lookUpPlayer(playerData["PLAYER No."], auction);
        if (existing_player) {
          var player = await AuctionPlayerModel.updateOne({ playerNumber: existing_player.playerNumber, auction: auction._id }, {
            marquee: true, auctionSet: newSet._id

          }, { upsert: false });
          console.log("markiee player updated");
        } else {
          console.log("markiee player not exits");
        }
      } catch (e) {
        console.log(e);
        return res.status(200).json({
          success: false,
          message: "Marquee set create for " + i + ", error: " + e.toString(),
        });
      }
    }// end marquee

    teams.forEach(async (team) => {
      console.log("_updateRemainingBudget", team._id);
      await _updateRemainingBudget(team._id);
    })

    res.status(200).json({
      success: true,
      message: "Auction data imported",
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};


async function _createTeam(teamName, auction) {
  var team = await AuctionTeamModel.findOne({ name: teamName, auction: auction._id });
  if (team) {
    return team;
  } else {
    var newAuctionTeam = new AuctionTeamModel({
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
  var set = await AuctionSetModel.findOne({ name: setName, auction: auction._id });
  if (set) {
    return set;
  } else {
    var obj = {
      name: setName,
      auction: auction._id,
      state: "idle"
    }
    if (isMarquee) {
      obj.state = "running";
    }
    var newAuctionSet = new AuctionSetModel(obj);
    newAuctionSet = await newAuctionSet.save();
    return newAuctionSet;
  }
}
async function _createPlayer(data, auction, set) {
  var existing_player = await AuctionPlayerModel.findOne({ playerNumber: data["PLAYER No."], auction: auction._id });
  if (existing_player) {
    return existing_player;
  } else {
    var newData = {};
    Object.keys(data).forEach((key) => {
      newData[playerDataMapping[key]] = data[key];
    });
    newData.auctionSet = set._id;
    // newData.auctionSet = _getSetId(setName, auction);
    newData.auction = auction._id;
    newData.marquee = false;
    try {


      if (newData.basePrice) {
        newData.basePrice = parseInt(newData.basePrice) * 100000;
      }
      if (newData.soldPrice) {
        newData.soldPrice = parseInt(newData.soldPrice) * 100000;
      }

    } catch (e) {

    }
    if (newData.team != "#N/A" && newData.soldPrice) {
      newData.team = await _getTeamId(newData.team, auction);
      newData.auctionStatus = "sold"
      newData.bidding = [{ team: newData.team, price: newData.soldPrice }];
    }
    if (newData.team == "#N/A") {
      newData.team = null;
    }

    var newPlayer = new AuctionPlayerModel(newData)
    newPlayer = await newPlayer.save();
    return newPlayer;
  }
}

async function _getTeamId(teamName, auction) {
  var team = await AuctionTeamModel.findOne({ name: teamName, auction: auction._id });
  return team._id;
}
async function _getSetId(setName, auction) {
  var set = await AuctionSetModel.findOne({ name: setName, auction: auction._id });
  return set._id;
}


async function _lookUpPlayer(playerNumber, auction) {
  var player = await AuctionPlayerModel.findOne({ playerNumber: playerNumber, auction: auction._id });
  return player;
}


exports.createNewAuction = async function (req, res) {
  try {
    const { name, organizer, password, budgetPerTeam } = req.body;
    var auction = await AuctionModel.findOne({ name: name });
    if (auction) {
      return res.status(200).json({
        success: false,
        message: "Auction with this name already present, please try with different name",
      });
    } else {
      var newAuction = new AuctionModel({
        name: name,
        organizer: organizer,
        password: password,
        budgetPerTeam: budgetPerTeam
      })
      newAuction = await newAuction.save();

      //using emmiters
      uniEE.emit("event",({
        type:"auction_created",
        data:newAuction
      }))

      res.status(200).json({
        success: true,
        message: "Auction is created ",
        result: newAuction,
      });
    }
  } catch (e) {
    console.log(e)
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
    const { set } = req.body;
    if (!set || !set._id) {
      return res.status(200).json({
        success: false,
        message: "Invalid payload is required",
      });
    }

    let updatedSet = await AuctionSetModel.updateOne({ _id: set._id }, set, { upsert: false });

    return res.status(200).json({
      success: true,
      message: "Set is updated to " + set.state,
      auction: updatedSet
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
    var team = await AuctionTeamModel.findOne({ name: name, auction: auction._id });
    if (team) {
      return res.status(200).json({
        success: false,
        message: "Team with this name already present in current auction, please try with different name",
      });
    } else {
      var newAuctionTeam = new AuctionTeamModel({
        name: name,
        owner: owner,
        auction: auction._id,
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
exports.removeNewAuctionTeam = async (req, res) => {
  try {
    const { team } = req.body;
    if (!team || !team._id) {
      return res.status(200).json({
        success: false,
        message: "auction id is required",
      });
    }
    var players = await AuctionPlayerModel.findOne({ team: team._id });
    if (players) {
      return res.status(200).json({
        success: false,
        message: "Team has player assigned, please remove them first",
      });
    } else {
      var t = await AuctionTeamModel.deleteOne({ _id: team._id });
      return res.status(200).json({
        success: true,
        message: "Team removed",
        result: t,
      });
    }
  } catch (e) {
    console.log(e);
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
    var set = await AuctionSetModel.findOne({ name: name, auction: auction._id });
    if (set) {
      return res.status(200).json({
        success: false,
        message: "Set with this name already present in current auction, please try with different name",
      });
    } else {

      let highestOrderDoc = await AuctionSetModel
        .findOne()                      // Find one document
        .sort({ order: -1 })             // Sort by 'order' in descending order (highest first)
        .exec();
      if (!highestOrderDoc) {
        highestOrderDoc = { order: 0 };
      }
      var newAuctionSet = new AuctionSetModel({
        name: name,
        order: highestOrderDoc.order + 1,
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
    var existing_player_with_set = await AuctionPlayerModel.findOne({ auctionSet: set._id });
    if (existing_player_with_set) {
      return res.status(200).json({
        success: false,
        message: "Set with this name already have player assigned, please try after remove all players from set",
      });
    } else {

      const delete_set = await AuctionSetModel.deleteOne({ _id: set._id })

      res.status(200).json({
        success: true,
        message: "Set created",
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
          var newPlayer = new AuctionPlayerModel({
            auction: auction._id,
            ...player
          })
          newPlayer = await newPlayer.save();
        } catch (err) {
          console.log(err);
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

    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      let updatedPlayer = await AuctionPlayerModel.updateOne({ _id: player._id }, player, { upsert: false });
      if (player.team) {
        await _updateRemainingBudget(player.team);
      }
    }
    // players.forEach(async (player) => {
    //   let updatedPlayer = await AuctionPlayerModel.updateOne({ _id: player._id }, player, { upsert: false });
    //   if (player.team) {
    //     await _updateRemainingBudget(player.team);
    //   }
    // });

    return res.status(200).json({
      success: true,
      message: "Player Updated",
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

async function _updateRemainingBudget(teamId) {
  console.log("_updateRemainingBudget", teamId);
  var teamPlayers = await AuctionPlayerModel.find({ team: teamId });
  var spentBudget = 0;
  teamPlayers.forEach(element => {
    spentBudget += element.soldPrice;
  });
  const team = await AuctionTeamModel.findOne({ _id: teamId });
  if (team) {
    var remainingBudget = team.budget - spentBudget;
    await AuctionTeamModel.updateOne({ _id: teamId }, { remainingBudget: remainingBudget }, { upsert: false });
    console.log("_updateRemainingBudget moddel", teamId);
  }
  console.log("_updateRemainingBudget end", teamId);
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
    var auction = await AuctionModel.findOne({ _id: auctionId });
    if (auction) {
      var teams = await AuctionTeamModel.find({ auction: auctionId });
      var players = await AuctionPlayerModel.find({ auction: auctionId });
      var sets = await AuctionSetModel.find({ auction: auctionId });

      return res.status(200).json({
        success: true,
        message: "Action details available",
        auction: auction,
        teams: teams,
        players: players,
        sets: sets
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


