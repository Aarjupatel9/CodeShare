const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


exports.genJWTToken = (payload, type = null) => {
  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_SEC,
      {
        expiresIn: type ? process.env.JWT_EXP_VERIFICATION_EMAIL : process.env.JWT_EXP
      });



    return token;
  } catch (error) {
    console.log(error);
    throw new Error("Error generating JWT token");
  }



}



exports.verifyJWTToken = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SEC);
    return payload;
  } catch (error) {
    throw error;
  }
}



exports.generateHashPassword = async (password) => {



  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);



  return hash;
}




exports.compareHashPassword = async (password, userPassword) => {



  const isMatch = await bcrypt.compare(password, userPassword);



  return isMatch;
}


exports.sendEmail = async ({ to, subject, text }) => {
  // Configure the transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASS,
    },

  });
  // Define the email options
  const mailOptions = {
    from: process.env.APP_EMAIL,
    to,
    subject,
    text,
  };
  // Send the email
  console.log("Email send return");
  return transporter.sendMail(mailOptions);
}