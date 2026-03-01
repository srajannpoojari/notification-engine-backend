const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  field: { type: String, required: true },     // e.g., "priority_hint"
  operator: { type: String, required: true },  // equals, contains
  value: { type: String, required: true },
  classification: { type: String, required: true }, // NOW, LATER, NEVER
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Rule", RuleSchema);