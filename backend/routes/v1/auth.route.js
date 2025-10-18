const express = require("express");
const { login, register, forgetpassword, resetpassword, getUserDetails, logout } = require("../../controllers/authController");
const authenticateUser = require('../../middleware/Authmiddleware');

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgetpassword);
router.get("/reset-password/:id/:token", resetpassword);
router.post("/reset-password/:id/:token", resetpassword);

// Protected routes
router.post("/verify-token", authenticateUser(), getUserDetails);

module.exports = router;

