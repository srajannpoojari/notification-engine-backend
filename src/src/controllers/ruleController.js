const Rule = require("../models/Rule");

/* =========================
   GET ALL RULES
========================= */
exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rules",
      error: error.message
    });
  }
};

/* =========================
   CREATE RULE
========================= */
exports.createRule = async (req, res) => {
  try {
    const rule = await Rule.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Rule created successfully",
      data: rule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create rule",
      error: error.message
    });
  }
};

/* =========================
   UPDATE RULE
========================= */
exports.updateRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Rule not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rule updated successfully",
      data: rule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update rule",
      error: error.message
    });
  }
};

/* =========================
   DELETE RULE
========================= */
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Rule not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rule deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete rule",
      error: error.message
    });
  }
};