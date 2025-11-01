const batchedLogger = require('../utils/batchedActivityLogger');

/**
 * Activity Logger Middleware
 * Logs user activities to the database using batched logging
 * 
 * @param {string} action - Action type (e.g., 'login', 'document_create')
 * @param {string} resourceType - Resource type (e.g., 'document', 'file')
 */
module.exports = (action, resourceType = null) => {
    return async (req, res, next) => {
        // Continue with request (don't block)
        next();

        // Log activity asynchronously (don't block request)
        setImmediate(() => {
            try {
                // Optimize details object: store only essential info, limit size
                const optimizedDetails = {};
                
                // Store method and path (essential)
                optimizedDetails.method = req.method;
                optimizedDetails.path = req.path.length > 100 ? req.path.substring(0, 100) : req.path;
                
                // Store only key fields from body (not entire body to save space)
                if (req.body && typeof req.body === 'object') {
                    const allowedKeys = ['slug', 'name', 'unique_name', 'title', 'type']; // Only essential fields
                    allowedKeys.forEach(key => {
                        if (req.body[key] !== undefined) {
                            const value = String(req.body[key]);
                            optimizedDetails[key] = value.length > 50 ? value.substring(0, 50) : value;
                        }
                    });
                }

                // Add log to batched queue
                batchedLogger.addLog({
                    userId: req.user?._id || req.admin?._id || null,
                    action: action,
                    resourceType: resourceType,
                    resourceId: req.params?.id || req.body?.id || null,
                    details: Object.keys(optimizedDetails).length > 0 ? optimizedDetails : undefined, // Only store if has data
                    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null,
                    userAgent: req.headers['user-agent'] || null
                });
            } catch (error) {
                console.error('Activity logging failed:', error);
                // Don't throw - logging should not break requests
            }
        });
    };
};

