const ActivityLog = require("../models/activityLogModel");
const batchedLogger = require("./batchedActivityLogger");

/**
 * Error Logger Utility
 * 
 * Provides structured error logging to database using ActivityLog model
 * 
 * Usage:
 *   const logger = require('../utils/loggerUtility');
 *   
 *   try {
 *     // your code
 *   } catch (error) {
 *     logger.logError(error, req, {
 *       controller: 'documentController',
 *       function: 'getDocument',
 *       context: { documentId: id }
 *     });
 *     res.status(500).json({ success: false, message: 'Error...' });
 *   }
 */

/**
 * Sanitize request body/params to remove sensitive information
 */
function sanitizeRequestData(data) {
    if (!data || typeof data !== 'object') return {};
    
    const sensitiveFields = ['password', 'token', 'secret', 'apikey', 'apiKey', 'authorization'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***REDACTED***';
        }
    });
    
    // Limit object size
    const jsonString = JSON.stringify(sanitized);
    if (jsonString.length > 500) {
        // Truncate large objects
        return { _truncated: true, _size: jsonString.length };
    }
    
    return sanitized;
}

/**
 * Extract error type from error object
 */
function getErrorType(error) {
    if (!error) return 'UnknownError';
    if (error.name) return error.name;
    if (error.constructor && error.constructor.name) return error.constructor.name;
    return 'Error';
}

/**
 * Determine error level based on error type and message
 */
function getErrorLevel(error, context = {}) {
    // Critical errors - system failures, database connection issues, etc.
    const criticalPatterns = [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'database',
        'connection',
        'timeout',
        'memory',
        'out of memory'
    ];
    
    const errorString = (error?.message || '').toLowerCase();
    if (criticalPatterns.some(pattern => errorString.includes(pattern))) {
        return 'critical';
    }
    
    // Explicitly set level in context
    if (context.level && ['error', 'warning', 'critical'].includes(context.level)) {
        return context.level;
    }
    
    // Validation errors are usually warnings
    if (error?.name === 'ValidationError' || error?.message?.includes('validation')) {
        return 'warning';
    }
    
    // Default to error
    return 'error';
}

/**
 * Extract controller and function name from stack trace
 */
function extractLocation(error, context) {
    let controller = context.controller || 'unknown';
    let functionName = context.function || 'unknown';
    
    if (error?.stack) {
        const stackLines = error.stack.split('\n');
        // Try to find controller name in stack trace
        for (const line of stackLines) {
            // Look for patterns like "at exports.getDocument" or "at Object.<anonymous>"
            if (line.includes('exports.') || line.includes('async')) {
                const match = line.match(/(?:exports\.|async )([a-zA-Z]+)/);
                if (match && match[1]) {
                    functionName = match[1];
                }
            }
            // Look for controller file path
            if (line.includes('controllers/')) {
                const match = line.match(/controllers[\/\\]([^\/\\]+)/);
                if (match && match[1]) {
                    controller = match[1].replace('.js', '');
                }
            }
        }
    }
    
    return { controller, function: functionName };
}

/**
 * Log error to database using ActivityLog model
 * 
 * @param {Error} error - The error object
 * @param {Object} req - Express request object (optional)
 * @param {Object} context - Additional context information
 * @param {String} context.controller - Controller name
 * @param {String} context.function - Function name
 * @param {String} context.level - Error level ('error', 'warning', 'critical')
 * @param {Object} context.context - Additional context data
 * @param {String} context.resourceType - Resource type (optional)
 * @param {String} context.resourceId - Resource ID (optional)
 * @returns {Promise<void>}
 */
async function logError(error, req = null, context = {}) {
    try {
        // Extract error information
        const errorMessage = error?.message || String(error) || 'Unknown error';
        const errorStack = error?.stack || null;
        const errorType = getErrorType(error);
        const errorLevel = getErrorLevel(error, context);
        
        // Extract location information
        const { controller, function: functionName } = extractLocation(error, context);
        
        // Extract request information
        let userId = null;
        let ipAddress = null;
        let userAgent = null;
        let resourceType = context.resourceType || 'system';
        let resourceId = context.resourceId || null;
        
        // Build details object with error information (limited to 500 bytes)
        const errorDetails = {
            errorType: errorType,
            controller: controller,
            function: functionName,
            level: errorLevel,
            message: errorMessage.substring(0, 200), // Truncate message for details
            stack: errorStack ? errorStack.substring(0, 200) : null, // Truncate stack for details
        };
        
        // Add request context if available
        if (req) {
            userId = req.user?._id || req.admin?._id || null;
            ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;
            userAgent = req.headers['user-agent'] || null;
            
            // Add sanitized request data to details
            const requestInfo = {
                method: req.method,
                path: (req.path || req.url || '').substring(0, 100),
                params: sanitizeRequestData(req.params),
                query: sanitizeRequestData(req.query),
            };
            
            // Merge request info into details, but ensure total size <= 500 bytes
            Object.assign(errorDetails, requestInfo);
            
            // Add additional context if provided
            if (context.context) {
                const sanitizedContext = sanitizeRequestData(context.context);
                Object.assign(errorDetails, { customContext: sanitizedContext });
            }
        }
        
        // Determine action based on error level
        let action = 'system_error';
        if (errorLevel === 'warning') {
            action = 'system_warning';
        } else if (errorLevel === 'critical') {
            action = 'system_error'; // Keep as system_error, but details will indicate critical
        }
        
        // Prepare activity log data
        const activityLogData = {
            userId: userId || null,
            action: action,
            resourceType: resourceType,
            resourceId: resourceId,
            details: errorDetails,
            ipAddress: ipAddress ? ipAddress.substring(0, 45) : null,
            userAgent: userAgent || null,
        };
        
        // Log to database asynchronously using batched logger (don't block the request)
        setImmediate(() => {
            try {
                // Ensure details object doesn't exceed 500 bytes
                const detailsString = JSON.stringify(activityLogData.details);
                if (detailsString.length > 500) {
                    // Truncate details if too large
                    activityLogData.details = JSON.parse(
                        detailsString.substring(0, 490) + '..."truncated"'
                    );
                }
                
                // Add to batched logger queue
                batchedLogger.addLog(activityLogData);
                
                // Also log critical errors to console for immediate visibility
                if (errorLevel === 'critical') {
                    console.error('🚨 CRITICAL ERROR:', errorMessage);
                    console.error('Controller:', controller, 'Function:', functionName);
                    console.error('Stack:', errorStack);
                }
            } catch (logError) {
                // If logging fails, at least log to console
                console.error('Failed to queue error log:', logError);
                console.error('Original error:', error);
            }
        });
        
    } catch (err) {
        // Fallback: if logging fails, at least log to console
        console.error('Error in loggerUtility.logError:', err);
        console.error('Original error that failed to log:', error);
    }
}

/**
 * Log warning (convenience method)
 */
async function logWarning(error, req, context) {
    return logError(error, req, { ...context, level: 'warning' });
}

/**
 * Log critical error (convenience method)
 */
async function logCritical(error, req, context) {
    return logError(error, req, { ...context, level: 'critical' });
}

module.exports = {
    logError,
    logWarning,
    logCritical,
    sanitizeRequestData,
    getErrorType,
    getErrorLevel
};

