const DataModel = require("../../models/dataModels");
const UserModel = require("../../models/userModels");
const mongoose = require("mongoose");
const logger = require("../../utils/loggerUtility");

const ObjectId = mongoose.Types.ObjectId;

const max_file_size = process.env.MAX_FILE_SIZE;
const allowed_for_slug = process.env.ALLOW_FILE_LIMIT;

/**
 * Get document by ID or slug
 * GET /api/v1/documents/public/:slug (public)
 * GET /api/v1/documents/:id (private)
 */
exports.getDocument = async (req, res) => {
  try {
    const { id, slug } = req.params;
    const { version, flag } = req.query;
    const user = req.user;

    let data_present;
    const identifier = slug || id;

    if (version) {
      data_present = await _getRequiredDataVersion(identifier, version, user?._id);
    } else if (flag === "allVersion") {
      data_present = await _getAllVersion(identifier, user?._id);
    } else {
      data_present = await _getLatestDataVersion(identifier, user?._id);
    }

    if (data_present) {
      const requiredPayload = {
        _id: data_present._id,
        data: data_present.data,
        unique_name: data_present.unique_name,
        language: data_present.language,
      };

      if (flag !== "allVersion" && data_present.latestDataVersion) {
        requiredPayload.data = data_present.latestDataVersion;
      }
      if (flag === "specific" && data_present.dataVersion) {
        requiredPayload.data = data_present.dataVersion;
      }
      if (flag === "allVersion") {
        requiredPayload.data = data_present.dataVersion;
      }

      res.status(200).json({
        success: true,
        message: "Document found",
        data: requiredPayload,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'getDocument',
      resourceType: 'document',
      resourceId: identifier,
      context: { version, flag, userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get all documents for authenticated user
 * GET /api/v1/documents
 * Query params:
 *   - fields: Comma-separated list of fields to return (default: unique_name,language,createdAt,updatedAt)
 *             Use '*' to return all fields
 * Example: GET /api/v1/documents?fields=unique_name,createdAt
 */
exports.getDocuments = async (req, res) => {
  try {
    const user = req.user;
    const { fields } = req.query;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Parse field selection
    let selectFields = 'unique_name language createdAt updatedAt'; // Default minimal fields
    if (fields) {
      if (fields === '*') {
        // Select all fields (MongoDB default behavior when no select is used)
        selectFields = '';
      } else {
        // Convert comma-separated list to space-separated for Mongoose
        selectFields = fields.split(',').map(f => f.trim()).join(' ');
      }
    }

    const query = DataModel.find({ 
      owner: user._id, 
      isDeleted: { $ne: true } 
    }).sort({ updatedAt: -1 });

    // Only apply select if fields are specified (empty string means select all)
    if (selectFields) {
      query.select(selectFields);
    }

    const documents = await query;

    res.status(200).json({
      success: true,
      message: "Documents retrieved successfully",
      data: documents,
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'getDocuments',
      resourceType: 'document',
      context: { userId: req?.user?._id, fields: req.query?.fields }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Create new document
 * POST /api/v1/documents
 */
exports.createDocument = async (req, res) => {
  try {
    const { slug, data } = req.body;
    const user = req.user;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const existingDoc = await DataModel.findOne({
      unique_name: slug,
      owner: user?._id,
      isDeleted: { $ne: true }
    });

    if (existingDoc) {
      return res.status(409).json({
        success: false,
        message: "Document with this slug already exists",
      });
    }

    const newData = {
      time: new Date().getTime(),
      data: data || "",
      user: user?._id,
    };

    const newPage = new DataModel({
      unique_name: slug,
      dataVersion: [newData],
      owner: user?._id || null,
      access: user ? "private" : "public"
    });

    const savedDocument = await newPage.save();

    if (user) {
      await UserModel.updateOne(
        { _id: user._id },
        { $push: { pages: { pageId: savedDocument._id, right: "owner" } } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: savedDocument,
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'createDocument',
      resourceType: 'document',
      resourceId: slug,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Update document (add new version)
 * PUT /api/v1/documents/:id
 */
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, data } = req.body;
    const user = req.user;

    const identifier = id || slug;
    const latestVersion = await _getLatestDataVersion(identifier, user?._id);

    if (latestVersion?.latestDataVersion?.data === data) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
      });
    }

    const newData = {
      time: new Date().getTime(),
      data: data,
      user: user?._id,
    };

    // Match by _id if it's a valid ObjectId, otherwise by unique_name (slug)
    const matchCondition = {
      isDeleted: { $ne: true }
    };

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      matchCondition._id = identifier;
    } else {
      matchCondition.unique_name = identifier;
    }

    if (user) {
      matchCondition.owner = user._id;
    }

    const existingData = await DataModel.findOne(matchCondition);

    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    await DataModel.updateOne(
      { _id: existingData._id },
      { $push: { dataVersion: newData } }
    );

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: newData,
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'updateDocument',
      resourceType: 'document',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Delete document (soft delete)
 * DELETE /api/v1/documents/:id
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const page = await DataModel.findOne({ _id: id, owner: user._id });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    await DataModel.updateOne(
      { _id: id, owner: user._id },
      { isDeleted: true }
    );

    await UserModel.updateOne(
      { _id: user._id },
      { $pull: { pages: { pageId: id } } }
    );

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'deleteDocument',
      resourceType: 'document',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get document versions with pagination
 * GET /api/v1/documents/:id/versions
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 * Example: GET /api/v1/documents/:id/versions?page=2&limit=10
 */
exports.getDocumentVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

    // Build match condition
    const matchCondition = {
      $or: [
        { unique_name: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
      ],
      isDeleted: { $ne: true }
    };

    if (user?._id) {
      matchCondition.owner = new mongoose.Types.ObjectId(user._id);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Optimized aggregation with pagination
    const result = await DataModel.aggregate([
      { $match: matchCondition },
      {
        $project: {
          unique_name: 1,
          language: 1,
          totalVersions: { $size: "$dataVersion" },
          dataVersion: {
            $map: {
              input: { 
                $slice: [
                  { $reverseArray: "$dataVersion" }, // Latest first
                  skip, 
                  parseInt(limit)
                ]
              },
              as: "version",
              in: { time: "$$version.time" }
            }
          }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const document = result[0];

    res.status(200).json({
      success: true,
      message: "Versions retrieved successfully",
      data: {
        unique_name: document.unique_name,
        language: document.language,
        dataVersion: document.dataVersion,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: document.totalVersions,
          pages: Math.ceil(document.totalVersions / parseInt(limit))
        }
      }
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'getDocumentVersions',
      resourceType: 'document',
      resourceId: id,
      context: { userId: req?.user?._id, page: req.query?.page, limit: req.query?.limit }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

// NOTE: File management functions have been moved to fileController.js
// Files are now independent from documents - use /api/v1/files routes

// Helper functions
async function _getLatestDataVersion(slug, userId) {
  try {
    const matchCondition = {
      $or: [
        { unique_name: slug },
        { _id: mongoose.Types.ObjectId.isValid(slug) ? new mongoose.Types.ObjectId(slug) : null }
      ],
      isDeleted: { $ne: true }
    };

    if (userId) {
      matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }

    const result = await DataModel.aggregate([
      { $match: matchCondition },
      {
        $addFields: {
          dataVersion: {
            $cond: {
              if: { $eq: [{ $size: "$dataVersion" }, 0] },
              then: [{ time: null, data: null }],
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

    const doc = result.length > 0 ? result[0] : null;

    if (doc && doc.latestDataVersion && doc.latestDataVersion.time == null) {
      doc.latestDataVersion = undefined;
    }

    return doc;
  } catch (error) {
    logger.logError(error, null, {
      controller: 'documentController',
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
      $or: [
        { unique_name: slug },
        { _id: mongoose.Types.ObjectId.isValid(slug) ? new mongoose.Types.ObjectId(slug) : null }
      ],
      isDeleted: { $ne: true }
    };

    if (userId) {
      matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }

    const result = await DataModel.aggregate([
      { $match: matchCondition },
      { $unwind: "$dataVersion" },
      { $match: { "dataVersion.time": new Date(time) } },
    ]);

    return result && result.length > 0 ? result[0] : null;
  } catch (error) {
    logger.logError(error, null, {
      controller: 'documentController',
      function: '_getRequiredDataVersion',
      resourceType: 'document',
      context: { slug, time, userId }
    });
    return null;
  }
}

async function _getAllVersion(slug, userId) {
  try {
    const matchCondition = {
      $or: [
        { unique_name: slug },
        { _id: mongoose.Types.ObjectId.isValid(slug) ? new mongoose.Types.ObjectId(slug) : null }
      ],
      isDeleted: { $ne: true }
    };

    if (userId) {
      matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }

    const pipeline = [
      { $match: matchCondition },
      { $project: { files: 0, data: 0 } },
      {
        $project: {
          unique_name: 1,
          language: 1,
          dataVersion: {
            $map: {
              input: { $slice: ["$dataVersion", -30] },
              as: "version",
              in: { time: "$$version.time" },
            },
          },
        },
      },
    ];

    const result = await DataModel.aggregate(pipeline);
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    logger.logError(error, null, {
      controller: 'documentController',
      function: '_getAllVersion',
      resourceType: 'document',
      context: { slug, userId }
    });
    return null;
  }
}

/**
 * Rename document
 * PATCH /api/v1/documents/:id/rename
 */
exports.renameDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const owner = req.user;

    if (!id || !newName || !owner) {
      return res.status(400).json({ 
        success: false, 
        message: "Document ID and new name are required" 
      });
    }

    // Check if new name already exists
    const existingPage = await DataModel.findOne({ 
      unique_name: newName, 
      owner: owner._id,
      isDeleted: { $ne: true }
    });

    if (existingPage && existingPage._id.toString() !== id) {
      return res.status(400).json({ 
        success: false, 
        message: "A document with this name already exists" 
      });
    }

    // Update the document name
    const updatedPage = await DataModel.updateOne(
      { _id: id, owner: owner._id },
      { $set: { unique_name: newName } }
    );

    if (updatedPage.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document successfully renamed",
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'renameDocument',
      resourceType: 'document',
      resourceId: id,
      context: { newName, userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Reorder documents
 * PATCH /api/v1/documents/reorder
 */
exports.reorderDocuments = async (req, res) => {
  try {
    const { newOrder } = req.body;
    const owner = req.user;

    if (!newOrder || !Array.isArray(newOrder) || !owner) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request body - newOrder array is required" 
      });
    }

    // Build the update array for all pages
    const updateOps = newOrder.map((page, index) => ({
      updateOne: {
        filter: { _id: owner._id, "pages.pageId": new mongoose.Types.ObjectId(page.pageId._id || page.pageId) },
        update: { $set: { "pages.$.order": index } }
      }
    }));

    // Execute bulk update
    await UserModel.bulkWrite(updateOps);

    res.status(200).json({
      success: true,
      message: "Documents successfully reordered",
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'reorderDocuments',
      resourceType: 'document',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Toggle pin status of document
 * PATCH /api/v1/documents/:id/pin
 */
exports.togglePinDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    const owner = req.user;

    if (!id || typeof isPinned !== 'boolean' || !owner) {
      return res.status(400).json({ 
        success: false, 
        message: "Document ID and isPinned boolean are required" 
      });
    }

    // Update the pin status
    const result = await UserModel.updateOne(
      { _id: owner._id, "pages.pageId": id },
      { $set: { "pages.$.isPinned": isPinned } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: isPinned ? "Document successfully pinned" : "Document successfully unpinned",
    });
  } catch (e) {
    logger.logError(e, req, {
      controller: 'documentController',
      function: 'togglePinDocument',
      resourceType: 'document',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

