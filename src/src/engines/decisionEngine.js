const NotificationEvent = require("../models/NotificationEvent");
const Rule = require("../models/Rule");
const { classifyWithAI } = require("../services/aiService");

async function decisionEngine(eventData) {

  // 🔁 1️⃣ Duplicate Check
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const duplicate = await NotificationEvent.findOne({
    user_id: eventData.user_id,
    title: eventData.title,
    createdAt: { $gte: fiveMinutesAgo }
  });

  if (duplicate) {
    return {
      classification: "NEVER",
      ai_confidence: 0.95,
      fallback_used: false,
      reason: "Duplicate notification detected within 5 minutes",
      rule_triggered: "DUPLICATE_RULE"
    };
  }

  // 🔥 2️⃣ Fetch Active Rules From DB
  const rules = await Rule.find({ active: true }).sort({ createdAt: 1 });

  for (let rule of rules) {
    const fieldValue = eventData[rule.field];

    if (!fieldValue) continue;

    let matched = false;

    if (rule.operator === "equals") {
      matched = fieldValue === rule.value;
    }

    if (rule.operator === "contains") {
      matched = fieldValue.includes(rule.value);
    }

    if (matched) {
      return {
        classification: rule.classification,
        ai_confidence: 0.8,
        fallback_used: false,
        reason: `Matched dynamic rule: ${rule.name}`,
        rule_triggered: rule.name
      };
    }
  }

  // 🤖 3️⃣ If No Rule → Use AI For High Priority
  if (eventData.priority_hint === "high") {

    const aiResult = await classifyWithAI(eventData);

    return {
      classification: aiResult.classification,
      ai_confidence: aiResult.confidence,
      fallback_used: aiResult.fallback,
      reason: aiResult.fallback
        ? "AI failed — fallback classification applied"
        : "AI classification applied",
      rule_triggered: "AI_CLASSIFIER"
    };
  }

  // 🧠 4️⃣ Default
  return {
    classification: "NOW",
    ai_confidence: 0.7,
    fallback_used: false,
    reason: "Default classification applied",
    rule_triggered: "DEFAULT_RULE"
  };
}

module.exports = decisionEngine;