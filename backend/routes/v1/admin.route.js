const express = require("express");
const router = express.Router();
const adminMiddleware = require('../../middleware/adminMiddleware');
const {
    // Users
    getUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    resetUserPassword,
    getUserActivity,
    
    // Activity
    getActivityLogs,
    getActivityStats,
    getActivityFilterOptions,
    
    // Statistics
    getOverviewStats,
    
    // Documents
    getAllDocuments,
    deleteDocument,
    
    // Settings
    getSettings,
    updateSetting,
} = require("../../controllers/v1/adminController");
const activityLogger = require('../../middleware/activityLogger');

// Public endpoint for filter options (no auth required for caching)
router.get("/activity/filters", getActivityFilterOptions);

// All admin routes require admin authentication
router.use(adminMiddleware());

// User Management
router.get("/users", activityLogger('admin_action', 'user'), getUsers);
router.get("/users/:id", activityLogger('admin_action', 'user'), getUserDetails);
router.patch("/users/:id", activityLogger('admin_action', 'user'), updateUser);
router.delete("/users/:id", activityLogger('admin_action', 'user'), deleteUser);
router.post("/users/:id/reset-password", activityLogger('admin_action', 'user'), resetUserPassword);
router.get("/users/:id/activity", activityLogger('admin_action', 'user'), getUserActivity);

// Activity Monitoring
router.get("/activity", activityLogger('admin_action', 'system'), getActivityLogs);
router.get("/activity/stats", activityLogger('admin_action', 'system'), getActivityStats);

// Statistics
router.get("/statistics/overview", activityLogger('admin_action', 'system'), getOverviewStats);

// Document Management
router.get("/documents", activityLogger('admin_action', 'document'), getAllDocuments);
router.delete("/documents/:id", activityLogger('admin_action', 'document'), deleteDocument);

// System Settings
router.get("/settings", activityLogger('admin_action', 'system'), getSettings);
router.patch("/settings/:key", activityLogger('admin_action', 'system'), updateSetting);

module.exports = router;

