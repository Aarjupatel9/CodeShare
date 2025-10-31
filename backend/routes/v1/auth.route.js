const express = require("express");
const { login, register, getResetPasswordLink, validateResetToken, updatePassword, getUserDetails, logout } = require("../../controllers/authController");
const authenticateUser = require('../../middleware/Authmiddleware');

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/generate-reset-password-link", getResetPasswordLink);
router.get("/reset-password/:id/:token", validateResetToken);
router.post("/update-password/:id/:token", updatePassword);

// Protected routes
router.post("/verify-token", authenticateUser(), getUserDetails);

module.exports = router;

