const express = require("express");
const { login, register, getResetPasswordLink, validateResetToken, updatePassword, getUserDetails, logout } = require("../../controllers/authController");
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

// Protected routes
router.post("/verify-token", authenticateUser(), activityLogger('verify_token', 'user'), getUserDetails);

module.exports = router;

