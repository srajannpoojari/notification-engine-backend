const NotificationEvent = require("../models/NotificationEvent");
const { processNotificationAsync } = require("../services/asyncProcessor");

// CREATE Notification
async function createNotification(req, res) {
  try {
    const data = req.body;

    // Save immediately as PROCESSING
    const notification = await NotificationEvent.create({
      ...data,
      status: "PROCESSING"
    });

    // Run async processing (non-blocking)
    processNotificationAsync(notification._id);

    return res.status(201).json({
      success: true,
      message: "Notification received and processing asynchronously",
      data: {
        id: notification._id
      }
    });

  } catch (error) {
    console.error("❌ Create Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

// GET All Notifications
async function getNotifications(req, res) {
  try {
    const notifications = await NotificationEvent
      .find()
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);

  } catch (error) {
    console.error("❌ Fetch Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
}

module.exports = {
  createNotification,
  getNotifications
};