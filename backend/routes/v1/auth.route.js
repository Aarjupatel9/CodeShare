const express = require("express");
const { login, register, getResetPasswordLink, validateResetToken, updatePassword, getUserDetails, logout } = require("../../controllers/authController");
const { getAuthUrl, handleCallback, getConnectionStatus, disconnect } = require("../../controllers/v1/googleDriveOAuthController");
const authenticateUser = require('../../middleware/Authmiddleware');
const activityLogger = require('../../middleware/activityLogger');

const router = express.Router();

// Public routes
router.post("/register", activityLogger('register', 'user'), register);
router.post("/login", activityLogger('login', 'user'), login);
router.post("/logout", activityLogger('logout', 'user'), logout);
router.post("/generate-reset-password-link", activityLogger('reset_password', 'user'), getResetPasswordLink);
router.get("/reset-password/:id/:token", validateResetToken);
router.post("/update-password/:id/:token", activityLogger('update_password', 'user'), updatePassword);

// Google Drive OAuth routes
router.get("/google-drive/authorize", authenticateUser(), activityLogger('google_drive_auth', 'user'), getAuthUrl);
router.get("/google-drive/callback", handleCallback); // Public - called by Google (no auth needed)
router.get("/google-drive/status", authenticateUser(), getConnectionStatus);
router.delete("/google-drive/disconnect", authenticateUser(), activityLogger('google_drive_disconnect', 'user'), disconnect);

// Protected routes
router.post("/verify-token", authenticateUser(), activityLogger('verify_token', 'user'), getUserDetails);

module.exports = router;

