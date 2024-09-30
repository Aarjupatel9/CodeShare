const DataModel = require("../models/userModels");
const { genJWTToken, compareHashPassword, verifyJWTToken, generateHashPassword, sendEmail } = require('../services/authService');
const jwt = require('jsonwebtoken');


var allowed_for_slug = process.env.ALLOW_FILE_LIMIT;



exports.register = async function (req, res) {
    const { username, email, password } = req.body;
    const user = await DataModel.findOne({ email });
    if (user) {
        return res.status(500).json({ message: 'User already exists.', success: false });
    }
    try {
        const hashedPassword = await generateHashPassword(password);
        const newUser = new DataModel({
            username: username,
            password: hashedPassword,
            email: email,
        });
        const savedUser = await newUser.save();
        //Email
        const data = {
            username: username,
            password: hashedPassword,
            email: email,
        };



        const token = genJWTToken(data, 'register');



        res.status(200).json({ message: 'Successfully Registered ', success: true });



    } catch (e) {
        res.status(500).json({ message: 'An error occurred during registration ' + e, success: false });
    }
};


exports.login = async function (req, res) {
    const { email, password } = req.body;
    const user = await DataModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Email or Password is wrong.', success: false });
    }
    try {
        const match = await compareHashPassword(password, user.password);
        const payload = {
            username: user.username,
            email: user.email,
            password: user.password,
        };
        const token = genJWTToken(payload);
        if (match) {
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000000000
            });
            user.password = undefined;
            res.status(200).json({ message: 'Successfully Logged Inn.', success: true, user: user });
        }
        else {
            res.status(400).json({ message: 'Email or Password is wrong.', success: false });
        }



    } catch (e) {
        res.status(500).json({ message: 'An error occurred during registration', success: false });
    }
};


exports.forgetpassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await DataModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: `User doesn't exist.`, success: false });
        }


        const secret = process.env.TOKEN_SECRET + user.password;
        const token = jwt.sign({ email: user.email, _id: user._id }, secret, { expiresIn: '5m' });
        const url = process.env.RESET_PASSWORD_LINK;
        const link = `${url}/${user._id}/${token}`;


        // Setting up nodemailer transport
        console.log("Before SendEmail");
        await sendEmail({
            to: email,
            subject: 'Password Reset for Notes App',
            text: `Please use the following link to reset your password: ${link}`,
        });
        return res.status(200).json({ message: "Password reset link sent successfully to the registered email.", success: true });

    } catch (error) {
        console.error('Email sending error:', error);
        if (error.response) {
            return res.status(500).json({ message: 'Failed to send email.', error: error.response, success: false });
        }
        return res.status(500).json({ message: 'An unknown error occurred.', error: error.message, success: false });
    }
}
// Controller for handling password reset
exports.resetpassword = async (req, res) => {
    const { id, token } = req.params;


    // Handle GET request
    if (req.method === "GET") {
        try {
            // Find the user and verify the token
            const oldUser = await DataModel.findOne({ _id: id });
            if (!oldUser) {
                return res.status(400).json({ error: "User doesn't exist.", success: false });
            }


            // Verify the token to confirm it's valid
            const secret = process.env.TOKEN_SECRET + oldUser.password;
            const verify = jwt.verify(token, secret);


            res.render('resetPassword', { email: verify.email, id, token, status: "notverified" });
        } catch (error) {
            console.log(error);
            return res.status(401).json({ error: 'Token is invalid or has expired.', success: false });
        }
    }


    // Handle POST request
    else if (req.method === "POST") {
        const { password, confirmPassword } = req.body;


        try {
            // Check if passwords match
            if (password !== confirmPassword) {
                return res.status(400).json({ error: "Passwords do not match.", success: false });
            }


            // Find the user by ID
            const oldUser = await DataModel.findOne({ _id: id });
            if (!oldUser) {
                return res.status(400).json({ error: "User doesn't exist.", success: false });
            }


            // Verify the token again
            const secret = process.env.TOKEN_SECRET + oldUser.password;
            const verify = jwt.verify(token, secret);


            // Encrypt and update the new password
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password, salt);


            await DataModel.findByIdAndUpdate(id, { $set: { password: encryptedPassword } });
            res.render('resetPassword', { email: verify.email, id, token, status: "verified" });
            return res.status(200).json({ message: "Password reset successfully.", success: true });
        } catch (error) {
            console.log(error);
            return res.status(401).json({ error: 'Token is invalid or has expired.', success: false });
        }
    }
};