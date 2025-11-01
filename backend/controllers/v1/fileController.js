const FileModel = require("../../models/fileModels");
const UserModel = require("../../models/userModels");
const googleDriveService = require("../../services/googleDriveService");
const logger = require("../../utils/loggerUtility");

/**
 * ========================================
 * FILE MANAGEMENT (Independent from Documents)
 * ========================================
 */

/**
 * Get all files for authenticated user
 * GET /api/v1/files
 */
exports.getFiles = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const files = await FileModel.find({ 
      owner: user._id,
      isDeleted: false 
    })
    .select('-__v')
    .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Files retrieved successfully",
      data: files,
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'fileController',
      function: 'getFiles',
      resourceType: 'file',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Validate file upload
 * Checks user's file upload permissions and size limits
 */
exports.validateFile = async (req, res, next) => {
  try {
    const user = req.user;
    const fileSize = req.headers.filesize ? parseInt(req.headers.filesize) : null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if file upload is enabled for user (backward compatibility: undefined = false)
    const fileUploadEnabled = user.fileUploadEnabled !== undefined ? user.fileUploadEnabled : false;
    if (!fileUploadEnabled) {
      return res.status(403).json({
        success: false,
        message: "File upload is not enabled for your account. Please contact support.",
      });
    }

    // Check if Google Drive is connected (required for OAuth uploads)
    if (!user.googleDriveConnected) {
      return res.status(403).json({
        success: false,
        message: "Google Drive is not connected. Please connect your Google Drive account from your profile settings.",
      });
    }

    // Get user's file size limit (default 1MB if not set)
    const userFileSizeLimit = user.fileSizeLimit || (1 * 1024 * 1024); // Default 1MB
    
    // Allow special users to bypass limit (for backward compatibility)
    const allowed_for_slug = process.env.ALLOW_FILE_LIMIT;
    const bypassLimit = user.email?.includes(allowed_for_slug) || false;

    if (fileSize && fileSize > userFileSizeLimit && !bypassLimit) {
      const limitMB = (userFileSizeLimit / (1024 * 1024)).toFixed(1);
      return res.status(400).json({
        success: false,
        message: `File size must be less than ${limitMB}MB`,
      });
    }

    next();
  } catch (err) {
    logger.logError(err, req, {
      controller: 'fileController',
      function: 'validateFile',
      resourceType: 'file',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

/**
 * Upload file (independent from documents)
 * POST /api/v1/files
 * Uses Google Drive storage (FREE API)
 */
exports.uploadFile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
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

    // Double-check file size against user's limit (already validated in validateFile, but extra safety)
    const userFileSizeLimit = user.fileSizeLimit || (1 * 1024 * 1024); // Default 1MB
    const allowed_for_slug = process.env.ALLOW_FILE_LIMIT;
    const bypassLimit = user.email?.includes(allowed_for_slug) || false;
    
    if (req.file.size > userFileSizeLimit && !bypassLimit) {
      const limitMB = (userFileSizeLimit / (1024 * 1024)).toFixed(1);
      return res.status(400).json({
        success: false,
        message: `File size (${(req.file.size / (1024 * 1024)).toFixed(2)}MB) exceeds your limit of ${limitMB}MB`,
      });
    }

    // Upload to Google Drive using OAuth (user's Drive)
    try {
      console.log('📤 Uploading to Google Drive (OAuth)');
      
      // Get user's folder name (default: "CodeShare-Uploads")
      const folderName = user.fileUploadFolder || "CodeShare-Uploads";
      
      const result = await googleDriveService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        user._id.toString(), // Pass user ID for OAuth token
        folderName // Pass folder name to use/create folder
      );

      console.log(`✅ File stored in Google Drive (FREE): ${result.fileId}`);

      // Save file metadata to separate FileModel (independent from documents)
      const newFile = new FileModel({
        owner: user._id,
        name: req.file.originalname,
        storageMethod: 'google_drive',
        googleDriveFileId: result.fileId,
        url: result.url, // View link
        downloadUrl: result.downloadUrl, // Download link
        type: req.file.mimetype,
        size: result.size || req.file.size,
        uploadedAt: new Date(),
      });

      const savedFile = await newFile.save();

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: savedFile,
      });
    } catch (driveError) {
      logger.logError(driveError, req, {
        controller: 'fileController',
        function: 'uploadFile',
        resourceType: 'file',
        level: 'critical',
        context: { userId: req?.user?._id, fileName: req.file?.originalname }
      });
      return res.status(500).json({
        success: false,
        message: "Failed to upload to Google Drive: " + driveError.message,
      });
    }
  } catch (err) {
    logger.logError(err, req, {
      controller: 'fileController',
      function: 'uploadFile',
      resourceType: 'file',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

/**
 * Download file
 * GET /api/v1/files/:fileId
 * Uses Google Drive storage (FREE API)
 */
exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = req.user;

    if (!fileId || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // Find file in FileModel (files are user-owned, independent from documents)
    const file = await FileModel.findOne({
      _id: fileId,
      owner: user._id,
      isDeleted: false
    });

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

    // Download from Google Drive using OAuth (user's Drive)
    try {
      console.log('📥 Downloading from Google Drive (OAuth)');
      
      const stream = await googleDriveService.downloadFile(file.googleDriveFileId, user._id.toString());
      
      // Set response headers
      res.setHeader('Content-Type', file.type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');

      // Stream file to client
      stream.pipe(res);

      console.log('✅ File streamed from Google Drive (FREE)');
    } catch (driveError) {
      logger.logError(driveError, req, {
        controller: 'fileController',
        function: 'downloadFile',
        resourceType: 'file',
        resourceId: fileId,
        level: 'critical',
        context: { userId: req?.user?._id }
      });
      return res.status(500).json({
        success: false,
        message: "Failed to download from Google Drive: " + driveError.message,
      });
    }
  } catch (err) {
    logger.logError(err, req, {
      controller: 'fileController',
      function: 'downloadFile',
      resourceType: 'file',
      resourceId: req.params?.fileId,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

/**
 * Delete file
 * DELETE /api/v1/files/:fileId
 * Uses Google Drive storage (FREE API)
 */
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = req.user;

    if (!fileId || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // Find file in FileModel (files are user-owned, independent from documents)
    const file = await FileModel.findOne({
      _id: fileId,
      owner: user._id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete from Google Drive using OAuth (user's Drive)
    if (file.googleDriveFileId) {
      try {
        console.log('🗑️ Deleting from Google Drive (OAuth)');
        await googleDriveService.deleteFile(file.googleDriveFileId, user._id.toString());
        console.log('✅ File deleted from Google Drive (OAuth)');
      } catch (driveError) {
        logger.logError(driveError, req, {
          controller: 'fileController',
          function: 'deleteFile',
          resourceType: 'file',
          resourceId: fileId,
          level: 'warning',
          context: { userId: req?.user?._id }
        });
        // Continue with DB deletion even if Drive delete fails
      }
    }

    // Soft delete from FileModel (set isDeleted = true)
    await FileModel.updateOne(
      { _id: fileId, owner: user._id },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (err) {
    logger.logError(err, req, {
      controller: 'fileController',
      function: 'deleteFile',
      resourceType: 'file',
      resourceId: req.params?.fileId,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

