const UserModel = require("../../models/userModels");
const DataModel = require("../../models/dataModels");
const ActivityLog = require("../../models/activityLogModel");
const AdminSettings = require("../../models/adminModels");
const AuctionModel = require("../../models/auctionModel");
const mongoose = require("mongoose");
const logger = require("../../utils/loggerUtility");

/**
 * ========================================
 * USER MANAGEMENT
 * ========================================
 */

/**
 * Get all users with pagination and filters
 * GET /api/v1/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object with proper $and structure for combining conditions
    const conditions = [];
    
    // Search condition
    if (search) {
      conditions.push({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Role filter with backward compatibility
    if (role) {
      if (role === 'user') {
        // Match users with 'user' role OR users without role field (backward compatibility)
        conditions.push({
          $or: [
            { role: 'user' },
            { role: { $exists: false } }
          ]
        });
      } else {
        // For 'admin' or 'moderator', match exactly (these roles must be explicitly set)
        conditions.push({ role: role });
      }
    }
    
    // isActive filter with backward compatibility
    if (isActive !== '') {
      const activeValue = isActive === 'true';
      if (activeValue) {
        // Match active users: isActive === true OR isActive doesn't exist (backward compatibility)
        conditions.push({
          $or: [
            { isActive: true },
            { isActive: { $exists: false } }
          ]
        });
      } else {
        // Match inactive users: isActive === false (explicitly inactive only)
        conditions.push({ isActive: false });
      }
    }
    
    // Combine all conditions with $and
    const filter = conditions.length > 0 ? { $and: conditions } : {};

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Get users
    const users = await UserModel.find(filter)
      .select('-password') // Don't send passwords
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await UserModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getUsers',
      resourceType: 'user',
      context: { page, limit, search, role, isActive, userId: req.user._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Get user details
 * GET /api/v1/admin/users/:id
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id)
      .select('-password')
      .populate({
        path: 'pages.pageId',
        select: 'unique_name files createdAt updatedAt'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user activity count
    const activityCount = await ActivityLog.countDocuments({ userId: id });

    // Get recent activity
    const recentActivity = await ActivityLog.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action resourceType createdAt');

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: {
        user,
        stats: {
          totalDocuments: user.pages?.length || 0,
          activityCount,
          recentActivity
        }
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getUserDetails',
      resourceType: 'user',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Update user
 * PATCH /api/v1/admin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive, isVerified } = req.body;

    // Prevent admin from removing their own admin role
    if (req.admin._id.toString() === id && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin role",
      });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    const user = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'updateUser',
      resourceType: 'user',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Delete/deactivate user
 * DELETE /api/v1/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Prevent admin from deleting themselves
    if (req.admin._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    if (permanent === 'true') {
      // Permanently delete user
      await UserModel.findByIdAndDelete(id);
    } else {
      // Deactivate user
      await UserModel.findByIdAndUpdate(id, { isActive: false });
    }

    res.status(200).json({
      success: true,
      message: permanent === 'true' ? "User deleted permanently" : "User deactivated",
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'deleteUser',
      resourceType: 'user',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Reset user password
 * POST /api/v1/admin/users/:id/reset-password
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const { generateHashPassword } = require('../../services/authService');
    const hashedPassword = await generateHashPassword(newPassword);

    await UserModel.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'resetUserPassword',
      resourceType: 'user',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Get user activity
 * GET /api/v1/admin/users/:id/activity
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await ActivityLog.find({ userId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments({ userId: id });

    res.status(200).json({
      success: true,
      message: "User activity retrieved successfully",
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getUserActivity',
      resourceType: 'user',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * ========================================
 * ACTIVITY MONITORING
 * ========================================
 */

/**
 * Get activity logs
 * GET /api/v1/admin/activity
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId = '',
      email = '',
      action = '',
      resourceType = '',
      startDate = '',
      endDate = '',
    } = req.query;

    const filter = {};

    // If email is provided, find user by email first, then filter by userId
    if (email) {
      const user = await UserModel.findOne({ email: { $regex: email, $options: 'i' } }).select('_id');
      if (user) {
        filter.userId = user._id;
      } else {
        // If no user found with that email, return empty results by using $in with empty array
        filter.userId = { $in: [] };
      }
    } else if (userId) {
      filter.userId = userId;
    }

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await ActivityLog.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Activity logs retrieved successfully",
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getActivityLogs',
      resourceType: 'activity',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Get activity statistics
 * GET /api/v1/admin/activity/stats
 */
exports.getActivityStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activity counts by action
    const actionStats = await ActivityLog.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily activity count
    const dailyStats = await ActivityLog.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Activity statistics retrieved successfully",
      data: {
        actionStats,
        dailyStats,
        totalActivities: await ActivityLog.countDocuments({ createdAt: { $gte: startDate } })
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getActivityStats',
      resourceType: 'statistics',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * ========================================
 * STATISTICS & ANALYTICS
 * ========================================
 */

/**
 * Get overview statistics
 * GET /api/v1/admin/statistics/overview
 */
exports.getOverviewStats = async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers24h,
      activeUsers7d,
      activeUsers30d,
      totalDocuments,
      totalFiles,
      totalAuctions,
      newUsers24h,
      newUsers7d,
      newUsers30d
    ] = await Promise.all([
      UserModel.countDocuments({}),
      ActivityLog.distinct('userId', { action: 'login', createdAt: { $gte: last24h } }),
      ActivityLog.distinct('userId', { action: 'login', createdAt: { $gte: last7d } }),
      ActivityLog.distinct('userId', { action: 'login', createdAt: { $gte: last30d } }),
      DataModel.countDocuments({ isDeleted: { $ne: true } }),
      DataModel.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $unwind: { path: '$files', preserveNullAndEmptyArrays: true } },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0).catch(() => 0),
      AuctionModel.countDocuments({}).catch(() => 0) || 0,
      UserModel.countDocuments({ createdAt: { $gte: last24h } }),
      UserModel.countDocuments({ createdAt: { $gte: last7d } }),
      UserModel.countDocuments({ createdAt: { $gte: last30d } })
    ]);

    res.status(200).json({
      success: true,
      message: "Overview statistics retrieved successfully",
      data: {
        users: {
          total: totalUsers,
          active24h: activeUsers24h.length,
          active7d: activeUsers7d.length,
          active30d: activeUsers30d.length,
          new24h: newUsers24h,
          new7d: newUsers7d,
          new30d: newUsers30d
        },
        documents: {
          total: totalDocuments
        },
        files: {
          total: totalFiles[0]?.total || 0
        },
        auctions: {
          total: totalAuctions
        }
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getOverviewStats',
      resourceType: 'statistics',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * ========================================
 * DOCUMENT MANAGEMENT
 * ========================================
 */

/**
 * Get all documents
 * GET /api/v1/admin/documents
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      email = '',
      ownerId = ''
    } = req.query;

    const filter = { isDeleted: { $ne: true } };

    if (search) {
      filter.unique_name = { $regex: search, $options: 'i' };
    }

    // If email is provided, find user by email first, then filter by owner
    if (email) {
      const user = await UserModel.findOne({ email: { $regex: email, $options: 'i' } }).select('_id');
      if (user) {
        filter.owner = user._id;
      } else {
        // If no user found with that email, return empty results
        filter.owner = { $in: [] };
      }
    } else if (ownerId) {
      filter.owner = ownerId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const documents = await DataModel.find(filter)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('unique_name owner files createdAt updatedAt');

    const total = await DataModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Documents retrieved successfully",
      data: {
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getAllDocuments',
      resourceType: 'document',
      context: { page, limit, search, email, ownerId, userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Delete document
 * DELETE /api/v1/admin/documents/:id
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await DataModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'deleteDocument',
      resourceType: 'document',
      resourceId: id,
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * ========================================
 * SYSTEM SETTINGS
 * ========================================
 */

/**
 * Get all settings
 * GET /api/v1/admin/settings
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.find({}).sort({ category: 1, key: 1 });

    res.status(200).json({
      success: true,
      message: "Settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'getSettings',
      resourceType: 'settings',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

/**
 * Update setting
 * PATCH /api/v1/admin/settings/:key
 */
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await AdminSettings.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'adminController',
      function: 'updateSetting',
      resourceType: 'settings',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

