const DataModel = require("../../models/dataModels");
const UserModel = require("../../models/userModels");
const googleDriveService = require("../../services/googleDriveService");
const mongoose = require("mongoose");

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
        files: data_present.files,
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
    console.error("Error in getDocument:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get all documents for authenticated user
 * GET /api/v1/documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const documents = await DataModel.find({ 
      owner: user._id, 
      isDeleted: { $ne: true } 
    })
    .select('unique_name language createdAt updatedAt')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Documents retrieved successfully",
      data: documents,
    });
  } catch (e) {
    console.error("Error in getDocuments:", e);
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
    console.error("Error in createDocument:", e);
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
    console.error("Error in updateDocument:", e);
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
    console.error("Error in deleteDocument:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Get document versions
 * GET /api/v1/documents/:id/versions
 */
exports.getDocumentVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const versions = await _getAllVersion(id, user?._id);

    if (!versions) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Versions retrieved successfully",
      data: versions,
    });
  } catch (e) {
    console.error("Error in getDocumentVersions:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Upload file to document
 * POST /api/v1/documents/:id/files
 * Uses Google Drive storage (FREE API)
 */
exports.uploadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user || !id) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "File buffer is required",
      });
    }

    // Upload to Google Drive (FREE API)
    try {
      console.log('📤 Uploading to Google Drive (FREE API)');
      
      const result = await googleDriveService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const fileObject = {
        name: req.file.originalname,
        storageMethod: 'google_drive',
        googleDriveFileId: result.fileId,
        url: result.url, // View link
        downloadUrl: result.downloadUrl, // Download link
        type: req.file.mimetype,
        size: result.size || req.file.size,
        uploadedAt: new Date(),
      };

      console.log(`✅ File stored in Google Drive (FREE): ${result.fileId}`);

      // Save file metadata to MongoDB
      await DataModel.updateOne(
        { _id: id, owner: user._id },
        { $push: { files: fileObject } }
      );

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: fileObject,
      });
    } catch (driveError) {
      console.error('Google Drive upload failed:', driveError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload to Google Drive: " + driveError.message,
      });
    }
  } catch (err) {
    console.error("Error in uploadFile:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

/**
 * Download file from document
 * GET /api/v1/documents/:id/files/:fileId
 * Uses Google Drive storage (FREE API)
 */
exports.downloadFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const user = req.user;

    if (!id || !fileId || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // Get document
    const document = await DataModel.findOne({ 
      _id: id, 
      owner: user._id 
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Find file in document
    const file = document.files.id(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check if file has Google Drive ID
    if (!file.googleDriveFileId) {
      return res.status(400).json({
        success: false,
        message: "File is not stored in Google Drive",
      });
    }

    // Download from Google Drive (FREE API)
    try {
      console.log('📥 Downloading from Google Drive (FREE API)');
      
      const stream = await googleDriveService.downloadFile(file.googleDriveFileId);
      
      // Set response headers
      res.setHeader('Content-Type', file.type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');

      // Stream file to client
      stream.pipe(res);

      console.log('✅ File streamed from Google Drive (FREE)');
    } catch (driveError) {
      console.error('Google Drive download failed:', driveError);
      return res.status(500).json({
        success: false,
        message: "Failed to download from Google Drive: " + driveError.message,
      });
    }
  } catch (err) {
    console.error("Error in downloadFile:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

/**
 * Delete file from document
 * DELETE /api/v1/documents/:id/files/:fileId
 * Uses Google Drive storage (FREE API)
 */
exports.deleteFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const user = req.user;

    if (!id || !fileId || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const document = await DataModel.findOne({ _id: id, owner: user._id });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const file = document.files.id(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete from Google Drive (FREE API)
    if (file.googleDriveFileId) {
      try {
        console.log('🗑️ Deleting from Google Drive (FREE API)');
        await googleDriveService.deleteFile(file.googleDriveFileId);
        console.log('✅ File deleted from Google Drive (FREE)');
      } catch (driveError) {
        console.error('Google Drive delete failed:', driveError);
        // Continue with DB deletion even if Drive delete fails
      }
    }

    // Remove from database
    await DataModel.updateOne(
      { _id: id, owner: user._id },
      { $pull: { files: { _id: fileId } } }
    );

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (e) {
    console.error("Error in deleteFile:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

/**
 * Validate file upload
 */
exports.validateFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fileSize = req.headers.filesize;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    if ((!fileSize || fileSize > max_file_size) && !id.includes(allowed_for_slug)) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than " + max_file_size + " bytes",
      });
    }

    next();
  } catch (err) {
    console.error("Error in validateFile:", err);
    res.status(500).json({
      success: false,
      message: "Error validating file",
    });
  }
};

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
          files: { $first: "$files" },
        },
      },
    ]);

    const doc = result.length > 0 ? result[0] : null;

    if (doc && doc.latestDataVersion && doc.latestDataVersion.time == null) {
      doc.latestDataVersion = undefined;
    }

    return doc;
  } catch (error) {
    console.error("Error fetching latest data version:", error);
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
    console.error("Error fetching required data version:", error);
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
    console.error("Error fetching all versions:", error);
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
    console.error("Error in renameDocument:", e);
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
    console.error("Error in reorderDocuments:", e);
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
    console.error("Error in togglePinDocument:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + e.message,
    });
  }
};

