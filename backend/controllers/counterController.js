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
