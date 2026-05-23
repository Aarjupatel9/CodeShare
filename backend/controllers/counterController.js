const Counter = require("../models/counterModel");
const logger = require("../utils/loggerUtility");

exports.syncData = async (req, res) => {
    try {
        const userId = req.user._id;
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ message: "No data provided", success: false });
        }

        let counter = await Counter.findOne({ userId });
        if (counter) {
            // Strict Deep Validation to prevent data loss
            const serverData = counter.data || {};
            const localData = data || {};
            
            // O(1) Fast-Fail: If local grand_total is strictly less than server's, 
            // it's mathematically impossible for local to have all the server's data.
            const serverGrandTotal = serverData.grand_total || 0;
            const localGrandTotal = localData.grand_total || 0;
            if (serverGrandTotal > localGrandTotal) {
                return res.status(409).json({
                    message: "Sync Blocked: Local data is out of sync (lower total). Please pull first.",
                    success: false
                });
            }

            const serverDaily = serverData.daily_counts || {};
            const localDaily = localData.daily_counts || {};

            for (const date of Object.keys(serverDaily)) {
                const serverCategories = serverDaily[date];
                const localCategories = localDaily[date] || {};

                for (const category of Object.keys(serverCategories)) {
                    const serverCount = serverCategories[category] || 0;
                    const localCount = localCategories[category] || 0;

                    if (serverCount > localCount) {
                        return res.status(409).json({
                            message: `Sync Blocked: Server has higher count for '${category}' on ${date}. Please pull first.`,
                            success: false
                        });
                    }
                }
            }

            counter.data = data;
            await counter.save();
        } else {
            counter = new Counter({ userId, data });
            await counter.save();
        }

        res.status(200).json({ message: "Data synced successfully", success: true, data: counter.data });
    } catch (error) {
        logger.logError(error, req, {
            controller: 'counterController',
            function: 'syncData',
            resourceType: 'counter',
            context: { userId: req.user?._id }
        });
        res.status(500).json({ message: "Error syncing data", success: false, error: error.message });
    }
};

exports.getData = async (req, res) => {
    try {
        const userId = req.user._id;
        const counter = await Counter.findOne({ userId });

        if (!counter) {
            return res.status(404).json({ message: "No counter data found", success: false });
        }

        res.status(200).json({ success: true, data: counter.data });
    } catch (error) {
        logger.logError(error, req, {
            controller: 'counterController',
            function: 'getData',
            resourceType: 'counter',
            context: { userId: req.user?._id }
        });
        res.status(500).json({ message: "Error retrieving data", success: false, error: error.message });
    }
};
