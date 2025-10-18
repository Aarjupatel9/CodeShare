const DataModel = require("../../models/dataModels");
const UserModel = require("../../models/userModels");
const s3BucketService = require("../../services/s3BucketService");
const mongoose = require("mongoose");

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

    const matchCondition = {
      unique_name: identifier,
      isDeleted: { $ne: true }
    };

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

    const fileObject = {
      name: req.file.originalname,
      url: req.file.location,
      key: req.file.key,
      type: req.file.mimetype,
      others: {
        contentType: req.file.contentType,
        encoding: req.file.encoding,
        bucket: req.file.bucket,
        metadata: req.file.metadata,
        etag: req.file.etag,
        acl: req.file.acl,
      },
    };

    await DataModel.updateOne(
      { _id: id, owner: user._id },
      { $push: { files: fileObject } }
    );

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: fileObject,
    });
  } catch (err) {
    console.error("Error in uploadFile:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

/**
 * Delete file from document
 * DELETE /api/v1/documents/:id/files/:fileId
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

    // Remove from S3
    try {
      await s3BucketService.remove(file.key);
    } catch (err) {
      console.error("Error removing file from S3:", err);
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

