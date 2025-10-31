const express = require("express");
const { login, register, logout, getUserDetails } = require("../controllers/authController");
const authenticateUser = require('../middleware/Authmiddleware');

const authRouter = express.Router();

authRouter.route("/checkUserLogInStatus").post(authenticateUser(),getUserDetails)
authRouter.route("/login").post(login);
authRouter.route("/register").post(register);
authRouter.route("/logout").post(logout);
// Password reset routes are now only in v1 API (/api/v1/auth/*)
module.exports = authRouter;