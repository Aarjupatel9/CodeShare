const DataModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const {
    genJWTToken,
    compareHashPassword,
    verifyJWTToken,
    generateHashPassword,
    sendEmail,
} = require("../services/authService");
const jwt = require("jsonwebtoken");
const logger = require("../utils/loggerUtility");


exports.register = async function (req, res) {
    try {
        const { username, email, password } = req.body;
        const user = await DataModel.findOne({ email });
        if (user) {
            return res.status(500).json({ message: "User already exists.", success: false });
        }

        const hashedPassword = await generateHashPassword(password);
        const newUser = new DataModel({
            username: username,
            password: hashedPassword,
            email: email,
        });
        await newUser.save(); // save new user

        res.status(200).json({ message: "Successfully Registered ", success: true });
    } catch (e) {
        logger.logError(e, req, {
            controller: 'authController',
            function: 'register',
            resourceType: 'user',
            context: { email: req.body?.email, userId: req?.user?._id }
        });
        res.status(500).json({
            message: "An error occurred during registration " + e,
            success: false,
        });
    }
};


exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await DataModel.findOne({ email }).select("password");
        if (!user) {
            return res.status(400).json({ message: "Account not found for this email.", success: false });
        }

        const match = await compareHashPassword(password, user.password);
        if (match) {
            // Update lastLogin and increment loginCount
            await DataModel.findByIdAndUpdate(user._id, {
                lastLogin: new Date(),
                $inc: { loginCount: 1 }
            });

            const populatedUser = await DataModel.findOne({ email }).populate({
                path: "pages.pageId", // Populate the pageId field
                select: "unique_name files", // Select only the name field
            });
            const payload = {
                _id: populatedUser._id,
                username: populatedUser.username,
                email: populatedUser.email,
                password: populatedUser.password,
            };
            const token = genJWTToken(payload);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            populatedUser.password = undefined;
            res.status(200).json({
                message: "Login Successful.",
                success: true,
                user: populatedUser,
            });
        } else {
            res.status(400).json({ message: "Email or Password is wrong.", success: false });
        }
    } catch (e) {
        logger.logError(e, req, {
            controller: 'authController',
            function: 'login',
            resourceType: 'user',
            context: { email: req.body?.email, userId: req?.user?._id }
        });
        res.status(500).json({
            message: "An error occurred during registration",
            success: false,
        });
    }
};

exports.getUserDetails = async function (req, res) {
    try {
        const { email } = req.body;
        const user = await DataModel.findOne({ email }).populate({
            path: "pages.pageId", // Populate the pageId field
            select: "unique_name files", // Select only the name field
        });
        const payload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            password: user.password,
        };
        const token = genJWTToken(payload);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        user.password = undefined;
        res.status(200).json({
            message: "User is verified and logged in.",
            success: true,
            user: user,
        });
    } catch (e) {
        logger.logError(e, req, {
            controller: 'authController',
            function: 'getUserDetails',
            resourceType: 'user',
            context: { email: req.body?.email, userId: req?.user?._id }
        });
        res.status(500).json({
            message: "An error occurred during registration",
            success: false,
        });
    }
};

exports.getResetPasswordLink = async (req, res) => {
    try {
        const { email, frontendUrl: frontendUrlFromRequest } = req.body;
        const user = await DataModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: `User doesn't exist.`, success: false });
        }

        const secret = process.env.TOKEN_SECRET + user.password;
        const token = jwt.sign({ email: user.email, _id: user._id }, secret, {
            expiresIn: "5m",
        });
        
        // Get frontend URL from request body, fallback to environment variable
        const frontendUrl = frontendUrlFromRequest || process.env.FRONTEND_URL;
        if (!frontendUrl) {
            console.error("Frontend URL not provided in request and FRONTEND_URL environment variable is not set");
            return res.status(500).json({
                message: "Server configuration error. Please contact support.",
                success: false,
            });
        }
        
        // Create frontend URL for password reset page
        const link = `${frontendUrl}/auth/reset-password/${user._id}/${token}`;

        try {
            await sendEmail({
                to: email,
                subject: "Password Reset for Codeshare",
                text: `Please use the following link to reset your password: ${link}`,
            });
            
            return res.status(200).json({
                message: "Password reset link sent successfully to the registered email.",
                success: true,
            });
        } catch (err) {
            logger.logError(err, req, {
                controller: 'authController',
                function: 'getResetPasswordLink',
                resourceType: 'user',
                level: 'warning',
                context: { email: req.body?.email, userId: req?.user?._id }
            });
            
            // Determine appropriate error message based on error type
            let errorMessage = "Error while sending the recovery email. Please try again later.";
            
            if (err.code === 'EAUTH' || err.code === 'EENVELOPE') {
                errorMessage = "Email service authentication failed. Please contact support.";
            } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
                errorMessage = "Unable to connect to email service. Please try again later.";
            } else if (err.responseCode === 550 || err.responseCode === 551) {
                errorMessage = "Invalid email address. Please check your email and try again.";
            } else if (err.responseCode === 421 || err.responseCode === 450) {
                errorMessage = "Email service is temporarily unavailable. Please try again later.";
            } else if (err.message && err.message.includes('Invalid login')) {
                errorMessage = "Email service configuration error. Please contact support.";
            } else if (err.message && err.message.includes('timeout')) {
                errorMessage = "Request timed out. Please try again.";
            }
            
            return res.status(500).json({
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
                success: false,
            });
        }
    } catch (error) {
        logger.logError(error, req, {
            controller: 'authController',
            function: 'getResetPasswordLink',
            resourceType: 'user',
            context: { email: req.body?.email, userId: req?.user?._id }
        });
        return res.status(500).json({
            message: "An unknown error occurred.",
            error: error.message,
            success: false,
        });
    }
};
// Controller for validating reset token (GET request from frontend)
exports.validateResetToken = async (req, res) => {
    try {
        const { id, token } = req.params;

        // Find the user and verify the token
        const oldUser = await DataModel.findOne({ _id: id });
        if (!oldUser) {
            return res.status(400).json({ error: "User doesn't exist.", success: false });
        }

        try {
            // Verify the token to confirm it's valid
            const secret = process.env.TOKEN_SECRET + oldUser.password;
            const verify = jwt.verify(token, secret);

            return res.status(200).json({
                message: "Token is valid.",
                success: true,
                email: verify.email,
            });
        } catch (error) {
            logger.logWarning(error, req, {
                controller: 'authController',
                function: 'validateResetToken',
                resourceType: 'user',
                context: { userId: req?.user?._id }
            });
            return res.status(401).json({
                error: "Token is invalid or has expired.",
                success: false,
            });
        }
    } catch (error) {
        logger.logError(error, req, {
            controller: 'authController',
            function: 'validateResetToken',
            resourceType: 'user',
            context: { userId: req?.user?._id }
        });
        return res.status(500).json({
            error: "An error occurred while validating the token.",
            success: false,
        });
    }
};

// Controller for updating password (POST request from frontend)
exports.updatePassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match.", success: false });
        }

        // Find the user by ID
        const oldUser = await DataModel.findOne({ _id: id });
        if (!oldUser) {
            return res.status(400).json({ error: "User doesn't exist.", success: false });
        }

        try {
            // Verify the token
            const secret = process.env.TOKEN_SECRET + oldUser.password;
            jwt.verify(token, secret);

            // Encrypt and update the new password
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password, salt);

            await DataModel.findByIdAndUpdate(id, {
                $set: { password: encryptedPassword },
            });

            return res.status(200).json({
                message: "Password reset successfully.",
                success: true,
            });
        } catch (error) {
            logger.logWarning(error, req, {
                controller: 'authController',
                function: 'updatePassword',
                resourceType: 'user',
                context: { userId: req.params?.id, userIdFromReq: req?.user?._id }
            });
            return res.status(401).json({
                error: "Token is invalid or has expired.",
                success: false,
            });
        }
    } catch (error) {
        logger.logError(error, req, {
            controller: 'authController',
            function: 'updatePassword',
            resourceType: 'user',
            context: { userId: req.params?.id, userIdFromReq: req?.user?._id }
        });
        return res.status(500).json({
            error: "An error occurred while updating the password.",
            success: false,
        });
    }
};

exports.logout = async function (req, res) {
    try {
        res.clearCookie("token");
        res.status(200).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (e) {
        logger.logError(e, req, {
            controller: 'authController',
            function: 'logout',
            resourceType: 'user',
            context: { userId: req?.user?._id }
        });
        res.status(500).json({
            message: "An error occurred during logout",
            success: false,
        });
    }
};