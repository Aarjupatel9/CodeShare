const DataModel = require("../models/dataModels");
const UserModel = require("../models/userModels");
const mongoose = require("mongoose");
const logger = require("../utils/loggerUtility");


var max_file_size = process.env.MAX_FILE_SIZE;
var allowed_for_slug = process.env.ALLOW_FILE_LIMIT;


exports.getData = async function (req, res) {
  try {
    const { slug, flag, time, userId } = req.body;
    let data_present;
    if (time) {
      data_present = await _getRequiredDataVersion(slug, time, userId);
    } else if (flag == "allVersion") {
      data_present = await _getAllVersion(slug, userId);
    } else {
      data_present = await _getLatestDataVersion(slug, userId);
    }

    if (data_present) {
      const requiredPayload = {
        _id: data_present._id,
        data: data_present.data,
        unique_name: data_present.unique_name,
        language: data_present.language,
      };

      if (flag != "allVersion" && data_present.latestDataVersion) {
        requiredPayload.data = data_present.latestDataVersion;
      }
      if (flag == "specific" && data_present.dataVersion) {
        requiredPayload.data = data_present.dataVersion;
      }
      if (flag == "allVersion") {
        requiredPayload.data = data_present.dataVersion;
      }

      res.status(200).json({
        success: true,
        message: "data found",
        result: requiredPayload,
      });
    } else {
      res.status(200).json({
        success: false,
        message: "data not found",
      });
    }
  } catch (e) {
    logger.logError(e, req, {
      controller: 'userController',
      function: 'getData',
      resourceType: 'document',
      context: { slug: req.body?.slug, userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};

exports.removePage = async function (req, res) {
  try {
    const { pageId } = req.body;
    const owner = req.user;

    if (!pageId || !owner) {
      return res.status(400).json({ status: fasle, message: "Invalid requesrt body" });
    }
    var page = await DataModel.findOne({ _id: pageId, owner: owner._id })
    if (page) {

      var deletedPage = await DataModel.updateOne({ _id: pageId, owner: owner._id }, { isDeleted: true }, { upsert: false });

      var user = await UserModel.updateOne(
        { _id: owner._id },
        { $pull: { pages: { pageId: pageId } } },
        { upsert: false }
      );

      res.status(200).json({
        success: true,
        message: "Page successfully removed",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Page not found",
      });
    }
  } catch (e) {
    logger.logError(e, req, {
      controller: 'userController',
      function: 'removePage',
      resourceType: 'document',
      context: { pageId: req.body?.pageId, userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "internal server error : " + e,
    });
  }
};


exports.saveData = async (req, res) => {
  try {
    const { slug, data } = req.body;
    
    // Validate payload at the top
    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Document name (slug) is required",
      });
    }
    
    if (typeof data !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Document data must be a string",
      });
    }
    
    const latestVersion = await _getLatestDataVersion(slug);
    if (latestVersion?.latestDataVersion?.data == data) {
      return res.status(201).json({
        success: true,
        message: "data save successfully",
      });
    }
    const owner = req.body.owner;
    var newData = {
      time: new Date().getTime(),
      data: data,
    };
    const matchCondition = {
      unique_name: slug,
      isDeleted: { $ne: true }
    };
    if (owner) {
      matchCondition.owner = owner._id;
      newData.user = owner._id;
    }
    const existingData = await DataModel.findOne(matchCondition);
    var data_present;
    if (existingData) {
      data_present = await DataModel.updateOne(
        { _id: existingData._id },
        { $push: { dataVersion: newData } }
      );
      if (data_present) {
        res.status(200).json({
          success: true,
          message: "data save successfully",
          newData: newData,
        });
      }
    } else {
      var newPage = new DataModel({
        unique_name: slug,
        dataVersion: [newData],
        owner: owner ? owner._id : null,
        access: "private"
      });
      data_present = await newPage.save();
      if (owner) {
        await UserModel.updateOne({ _id: owner._id }, {
          $push: { pages: { pageId: data_present._id, right: "owner" } },
        });
      }
      if (data_present) {
        res.status(200).json({
          success: true,
          message: "data save successfully",
          newData: data_present,
          isInserted: true
        });
      }
    }
  } catch (e) {
    logger.logError(e, req, {
      controller: 'userController',
      function: 'saveData',
      resourceType: 'document',
      context: { slug: req.body?.slug, userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "internal server error : " + e.message,
    });
  }
};

// NOTE: File management functions (validateFile, saveFileNew, removeFile) have been removed
// Files are now independent from documents - use /api/v1/files routes via fileController.js


async function _getLatestDataVersion(slug, userId) {
  try {
    const matchCondition = {
      unique_name: slug,
      isDeleted: { $ne: true }
    };
    if (userId) {
      matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }
    var result = await DataModel.aggregate([
      { $match: matchCondition },
      {
        $addFields: {
          dataVersion: {
            $cond: {
              if: { $eq: [{ $size: "$dataVersion" }, 0] }, // Check if dataVersion is an empty array
              then: [{ time: null, data: null }], // Default value when dataVersion is empty
              else: "$dataVersion",
            },
          },
        },
      },
      { $unwind: "$dataVersion" },
      { $sort: { "dataVersion.time": -1 } },
      {
        $group: {
          _id: "$_id",
          data: { $first: "$data" },
          language: { $first: "$language" },
          unique_name: { $first: "$unique_name" },
          latestDataVersion: { $first: "$dataVersion" },
        },
      },
    ]);
    result = result.length > 0 ? result[0] : null;
    if (
      result &&
      result.latestDataVersion &&
      result.latestDataVersion.time == null
    ) {
      result.latestDataVersion = undefined;
    }

    return result;
  } catch (error) {
    logger.logError(error, null, {
      controller: 'userController',
      function: '_getLatestDataVersion',
      resourceType: 'document',
      context: { slug, userId }
    });
    return null;
  }
}

async function _getRequiredDataVersion(slug, time, userId) {
  try {
    const matchCondition = {
      unique_name: slug,
      isDeleted: { $ne: true }
    };
    if (userId) {
      matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }
    const result = await DataModel.aggregate([
      {
        $match: matchCondition,
      },
      {
        $unwind: "$dataVersion",
      },
      {
        $match: {
          "dataVersion.time": new Date(time),
        },
      },
    ]);


    return result && result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.logError(error, null, {
      controller: 'userController',
      function: '_getRequiredDataVersion',
      resourceType: 'document',
      context: { slug, time, userId }
    });
    return null;
  }
}

async function _getAllVersion(slug, userId) {
  const matchCondition = {
    unique_name: slug,
    isDeleted: { $ne: true }
  };
  if (userId) {
    matchCondition.owner = new mongoose.Types.ObjectId(userId);
  }
  const pipeline = [
    {
      $match: matchCondition, // Step 1: Match the document
    },
    {
      $project: {
        files: 0,
        data: 0,
      },
    },
    {
      $project: {
        unique_name: 1,
        language: 1,
        dataVersion: {
          $map: {
            input: { $slice: ["$dataVersion", -30] }, // Get last 5 entries
            as: "version",
            in: {
              time: "$$version.time",
              // Exclude the data field from the dataVersion array
            },
          },
        },
      },
    },
  ];
  // Execute the aggregation pipeline
  data_present = await DataModel.aggregate(pipeline);
  data_present = Array.isArray(data_present) ? data_present[0] : data_present;
  return data_present;
}