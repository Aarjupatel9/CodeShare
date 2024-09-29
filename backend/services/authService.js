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
    try {
      // Configure the transporter for sending emails
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com", // SMTP host
      port: process.env.SMTP_PORT || 587, // SMTP port (587 for TLS)
      secure: process.env.SMTP_SECURE || false, 
        requireTLS: true,
        auth: {
          user: process.env.APP_EMAIL,
          pass: process.env.APP_PASS,
        },
        // tls: {
        //   rejectUnauthorized: false,
        // },
      });
  
      // Define the email options
      const mailOptions = {
        from: process.env.APP_EMAIL,
        to,
        subject,
        text,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, message: "Failed to send email", error };
    }
  }