const mongoose = require("mongoose");

const NotificationEventSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  event_type: { type: String },
  title: { type: String },
  message: { type: String },
  source: { type: String },
  priority_hint: { type: String },
  channel: { type: String },

  classification: { type: String },
  ai_confidence: { type: Number },
  fallback_used: { type: Boolean, default: false },

  // 🔥 NEW FIELD FOR ASYNC PROCESSING
  status: {
    type: String,
    enum: ["PROCESSING", "COMPLETED", "FAILED"],
    default: "PROCESSING"
  },

  timestamp: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model("NotificationEvent", NotificationEventSchema);