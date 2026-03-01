const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "NotificationEvent" },
  decision: { type: String },
  reason: { type: String },
  rule_triggered: { type: String },
  ai_used: { type: Boolean, default: false },
  fallback_used: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", AuditLogSchema);