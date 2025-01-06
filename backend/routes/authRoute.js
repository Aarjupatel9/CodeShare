const express = require("express");
const { login, register, forgetpassword, resetpassword, getUserDetails } = require("../controllers/authController");
const authenticateUser = require('../middleware/Authmiddleware');

const authRouter = express.Router();

authRouter.route("/checkUserLogInStatus").post(authenticateUser(),getUserDetails)
authRouter.route("/login").post(login);
authRouter.route("/register").post(register);
authRouter.route('/forgetpassword').post(forgetpassword);
authRouter.route('/reset-password/:id/:token').get(resetpassword).post(resetpassword);
module.exports = authRouter;