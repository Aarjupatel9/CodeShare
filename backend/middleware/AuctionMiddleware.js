const { verifyJWTToken, genJWTToken } = require('../services/authService');
const AuctionModels = require('../models/auctionModel');

module.exports = () => {
    return async (req, res, next) => {
        const token = req.cookies.auction_token;
        if (!token) {
            return res.status(401).json({ success: false, message: "TokenExpiredError", details: "Not authorized, Session token not found." });
        }
        try {
            const { _id } = verifyJWTToken(token);

            try {
                const auction = await AuctionModels.findOne({ _id: _id });
                if (!auction) {
                    return res.status(401).json({ success: false, message: "TokenExpiredError", details: "Auction not found." });
                }
                req.auction = auction;
                next();
            } catch (error) {
                console.error(error);
                return res.status(401).json({ success: false, message: "Internal server error." });
            }

        } catch (error) {
            console.error(error);
            if (error.name == "TokenExpiredError") {
                return res.clearCookie("auction_token").status(401).json({ success: false, message: error.message, details: "Auction session expired." });
            } else {
                return res.status(401).json({ success: false, message: error.message });
            }
        }
    };
};