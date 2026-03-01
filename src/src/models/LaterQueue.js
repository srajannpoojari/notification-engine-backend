const mongoose = require("mongoose");

const LaterQueueSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "NotificationEvent" },
  status: { type: String, default: "PENDING" }, // PENDING, PROCESSED, FAILED
  retry_count: { type: Number, default: 0 },
  next_attempt_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("LaterQueue", LaterQueueSchema);