const express = require("express");
const authRouter = express.Router();

const {login,register,forgetpassword,resetpassword,checkAuth} = require("../controllers/authController");

authRouter.route("/login").post(login);
authRouter.route("/register").post(register);
authRouter.route('/forgetpassword').post(forgetpassword);
authRouter.route('/reset-password/:id/:token')
  .get(resetpassword)   // Handle GET request
  .post(resetpassword); 
module.exports = authRouter;