const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications
} = require("../controllers/notificationController");

// POST /notifications
router.post("/", createNotification);

// GET /notifications
router.get("/", getNotifications);

module.exports = router;