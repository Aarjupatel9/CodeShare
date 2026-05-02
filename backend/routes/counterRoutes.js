const express = require("express");
const router = express.Router();
const counterController = require("../controllers/counterController");
const authMiddleware = require("../middleware/Authmiddleware");

router.post("/sync", authMiddleware(), counterController.syncData);
router.get("/data", authMiddleware(), counterController.getData);

module.exports = router;
