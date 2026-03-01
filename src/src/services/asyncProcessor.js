const NotificationEvent = require("../models/NotificationEvent");
const AuditLog = require("../models/AuditLog");
const decisionEngine = require("../engines/decisionEngine");

exports.processNotificationAsync = async (notificationId) => {
  try {
    const notification = await NotificationEvent.findById(notificationId);

    if (!notification) {
      console.log("⚠ Notification not found for async processing");
      return;
    }

    // Run decision engine
    const result = await decisionEngine(notification);

    // Update notification
    notification.classification = result.classification;
    notification.ai_confidence = result.ai_confidence;
    notification.fallback_used = result.fallback_used;
    notification.status = "COMPLETED";

    await notification.save();

    // Create audit log
    await AuditLog.create({
      event_id: notification._id,
      decision: result.classification,
      reason: result.reason,
      rule_triggered: result.rule_triggered,
      ai_used: result.rule_triggered === "AI_CLASSIFIER",
      fallback_used: result.fallback_used
    });

    console.log(`✅ Async processing completed for ${notification._id}`);

  } catch (error) {
    console.error("❌ Async Processing Error:", error.message);

    await NotificationEvent.findByIdAndUpdate(notificationId, {
      status: "FAILED"
    });
  }
};