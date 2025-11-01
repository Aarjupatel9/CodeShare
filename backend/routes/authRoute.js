const express = require("express");
const { login, register, logout, getUserDetails } = require("../controllers/authController");
const authenticateUser = require('../middleware/Authmiddleware');
const activityLogger = require('../middleware/activityLogger');

const authRouter = express.Router();

authRouter.route("/checkUserLogInStatus").post(authenticateUser(), getUserDetails)
authRouter.route("/login").post(activityLogger('login', 'user'), login);
authRouter.route("/register").post(activityLogger('register', 'user'), register);
authRouter.route("/logout").post(activityLogger('logout', 'user'), logout);
// Password reset routes are now only in v1 API (/api/v1/auth/*)
module.exports = authRouter;