const { verifyJWTToken } = require('../services/authService');
const userModel = require('../models/userModels');

/**
 * Admin Authentication Middleware
 * Verifies user is authenticated AND has admin role
 */
module.exports = () => {
    return async (req, res, next) => {
        try {
            // First verify user authentication
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Authentication required" 
                });
            }

            const { _id } = verifyJWTToken(token);
            
            if (!_id) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid token" 
                });
            }

            // Get user from database
            const user = await userModel.findById(_id);

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Account is deactivated" 
                });
            }

            // Check if user is admin or moderator
            if (user.role !== 'admin' && user.role !== 'moderator') {
                return res.status(403).json({ 
                    success: false, 
                    message: "Admin access required" 
                });
            }

            // Attach admin user to request
            req.admin = user;
            req.user = user; // Also attach as user for consistency
            next();
        } catch (error) {
            console.error("Admin middleware error:", error);
            return res.status(401).json({ 
                success: false, 
                message: "Authentication failed" 
            });
        }
    };
};

