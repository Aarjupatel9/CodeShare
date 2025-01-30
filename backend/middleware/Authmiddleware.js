const { verifyJWTToken, genJWTToken } = require('../services/authService');
const userModel = require('../models/userModels');

module.exports = () => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!req.cookies.token && req.body && req.body.isPublic) {
                const data = {
                    _id: '',
                    username: 'username',
                    password: 'password',
                    email: 'email',
                    anonymous: true
                };
                const token = genJWTToken(data, 'register');
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 3600000000000
                });
                return next();
            }

            if (!token) {
                return res.status(401).json({ success: false, message: "TokenExpiredError", details: "Token not found" });
            }

            const { _id, anonymous } = verifyJWTToken(token);
            if (_id == '' && anonymous) {
                req.user = null;
                next();
            } else {
                try {
                    const user = await userModel.findById(_id);
                    if (!user) {
                        return res.status(401).json({ success: false, message: "TokenExpiredError", details: "User not found." });
                    }
                    req.user = user;
                    next();
                } catch (error) {
                    console.error(error);
                    return res.status(401).json({ success: false, message: "Internal server error" });
                }
            }
        } catch (error) {
            console.error(error);
            if (error.name == "TokenExpiredError") {
                return res.clearCookie("token").status(401).json({ success: false, message: error.message });
            } else {
                return res.status(401).json({ success: false, message: error.message });
            }
        }
    };
};