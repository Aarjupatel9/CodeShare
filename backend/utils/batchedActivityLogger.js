const ActivityLog = require("../models/activityLogModel");

/**
 * Batched Activity Logger
 * 
 * SERVER-LEVEL SINGLETON: Creates ONE shared queue for ALL API calls
 * This ensures all activity logs from different routes/controllers use the same queue.
 * 
 * Collects activity logs in a queue and writes them in batches for better performance.
 * Batches are processed when:
 * - 10 logs are queued, OR
 * - 10 seconds have elapsed since last batch
 */

class BatchedActivityLogger {
    constructor() {
        // SERVER-LEVEL SINGLETON: This queue is shared across ALL API calls
        this.queue = [];
        this.batchSize = 10; // Process when 10 logs are queued
        this.maxWaitTime = 10000; // 10 seconds in milliseconds
        this.lastProcessed = Date.now();
        this.timer = null;
        this.processing = false;
        this.nextBatchTime = null; // Track when next batch should be processed
        this.instanceId = Date.now(); // Unique ID to verify singleton
        this.totalLogsProcessed = 0; // Track total logs for monitoring
    }

    /**
     * Add log to queue
     * @param {Object} logData - Log data object
     */
    addLog(logData) {
        // Validate required fields
        if (!logData || !logData.action) {
            return;
        }

        // Optimize details object size
        if (logData.details && typeof logData.details === 'object') {
            const detailsString = JSON.stringify(logData.details);
            if (detailsString.length > 500) {
                // Truncate if too large
                logData.details = JSON.parse(detailsString.substring(0, 490) + '..."truncated"');
            }
        }

        // Add to queue
        this.queue.push({
            ...logData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Check if we should process immediately
        if (this.queue.length >= this.batchSize) {
            this.processBatch();
            return;
        }

        // Start/restart timer if needed
        this.startTimer();
    }

    /**
     * Start timer for batch processing
     */
    startTimer() {
        // Don't start timer if already processing
        if (this.processing) {
            return;
        }

        // If timer is already running and scheduled before max wait time, keep it
        if (this.timer && this.nextBatchTime && Date.now() < this.nextBatchTime) {
            return;
        }

        // Clear existing timer if any
        if (this.timer) {
            clearTimeout(this.timer);
        }

        // Calculate next batch processing time
        const timeSinceLastProcess = Date.now() - this.lastProcessed;
        const timeRemaining = Math.max(0, this.maxWaitTime - timeSinceLastProcess);
        
        // Set next batch time
        this.nextBatchTime = Date.now() + timeRemaining;

        // Set timer
        this.timer = setTimeout(() => {
            this.nextBatchTime = null;
            this.processBatch();
        }, timeRemaining);
    }

    /**
     * Process batch of logs
     */
    async processBatch() {
        // Prevent concurrent processing
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.nextBatchTime = null;

        // Get batch from queue
        const batch = this.queue.splice(0, this.batchSize);
        
        if (batch.length === 0) {
            this.processing = false;
            return;
        }

        try {
            // Insert batch using insertMany for efficiency
            await ActivityLog.insertMany(batch, { ordered: false });
            
            // Update last processed time
            this.lastProcessed = Date.now();
            this.totalLogsProcessed += batch.length;
        } catch (error) {
            console.error('❌ Error processing activity log batch:', error);
            
            // If batch insert fails, try individual inserts as fallback
            // This ensures we don't lose logs
            for (const log of batch) {
                try {
                    const activityLog = new ActivityLog(log);
                    await activityLog.save();
                } catch (individualError) {
                    console.error('❌ Failed to save individual log:', individualError);
                    // Continue with next log
                }
            }
        } finally {
            this.processing = false;

            // If there are more logs in queue, process them
            if (this.queue.length > 0) {
                if (this.queue.length >= this.batchSize) {
                    // Process immediately if batch size reached
                    setImmediate(() => this.processBatch());
                } else {
                    // Restart timer for remaining logs
                    this.startTimer();
                }
            }
        }
    }

    /**
     * Force process all remaining logs (useful for graceful shutdown)
     */
    async flush() {
        while (this.queue.length > 0 || this.processing) {
            if (!this.processing) {
                await this.processBatch();
            }
            // Wait a bit before checking again
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    /**
     * Get queue statistics (for debugging/monitoring)
     */
    getStats() {
        return {
            queueLength: this.queue.length,
            totalProcessed: this.totalLogsProcessed,
            instanceId: this.instanceId,
            isProcessing: this.processing,
            lastProcessed: this.lastProcessed
        };
    }
}

/**
 * SERVER-LEVEL SINGLETON INSTANCE
 * 
 * This instance is created once when the module is first required.
 * Node.js caches modules, so all subsequent require() calls will
 * return this same instance, ensuring a single shared queue across
 * all API calls and routes.
 */
let batchedLoggerInstance = null;

/**
 * Get or create the singleton instance
 * This ensures only one instance exists server-wide
 * All API calls will share the same queue
 */
function getInstance() {
    if (!batchedLoggerInstance) {
        batchedLoggerInstance = new BatchedActivityLogger();
        
        // Handle graceful shutdown - flush all logs
        process.on('SIGTERM', async () => {
            console.log('Flushing activity logs before shutdown...');
            await batchedLoggerInstance.flush();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('Flushing activity logs before shutdown...');
            await batchedLoggerInstance.flush();
            process.exit(0);
        });
    }
    return batchedLoggerInstance;
}

// Create and export singleton instance
// This ensures ONE queue shared by ALL API calls across the entire server
const batchedLogger = getInstance();

module.exports = batchedLogger;

