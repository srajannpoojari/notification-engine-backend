const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 Circuit Breaker State
let failureCount = 0;
let lastFailureTime = null;
let circuitOpen = false;

const FAILURE_THRESHOLD = 3;          // 3 failures
const FAILURE_WINDOW = 60 * 1000;     // within 1 minute
const COOLDOWN_PERIOD = 60 * 1000;    // 1 minute cooldown

function isCircuitOpen() {
  if (!circuitOpen) return false;

  // Check if cooldown passed
  const now = Date.now();
  if (now - lastFailureTime > COOLDOWN_PERIOD) {
    console.log("🔄 AI Circuit Reset After Cooldown");
    circuitOpen = false;
    failureCount = 0;
    return false;
  }

  return true;
}

async function classifyWithAI(eventData) {

  // 🚨 If circuit open → skip AI
  if (isCircuitOpen()) {
    console.log("⚠️ AI Circuit Open — Using Fallback");
    return {
      classification: "NOW",
      confidence: 0.5,
      fallback: true,
      circuit_open: true
    };
  }

  try {

    const prompt = `
You are a notification prioritization engine.

Classify the notification into one of these categories:
NOW, LATER, NEVER

Return JSON only:
{
  "classification": "...",
  "confidence": 0.0
}

Notification:
Title: ${eventData.title}
Message: ${eventData.message}
Event Type: ${eventData.event_type}
Priority Hint: ${eventData.priority_hint}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an intelligent notification classifier." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
    });

    const text = response.choices[0].message.content;

    const parsed = JSON.parse(text);

    // ✅ Reset failures on success
    failureCount = 0;
    circuitOpen = false;

    return {
      classification: parsed.classification || "NOW",
      confidence: parsed.confidence || 0.7,
      fallback: false,
      circuit_open: false
    };

  } catch (error) {

    console.error("❌ AI Error:", error.message);

    const now = Date.now();

    // Track failures within window
    if (!lastFailureTime || now - lastFailureTime > FAILURE_WINDOW) {
      failureCount = 1;
    } else {
      failureCount += 1;
    }

    lastFailureTime = now;

    if (failureCount >= FAILURE_THRESHOLD) {
      console.log("🚨 AI Circuit Opened Due To Repeated Failures");
      circuitOpen = true;
    }

    return {
      classification: "NOW",
      confidence: 0.5,
      fallback: true,
      circuit_open: circuitOpen
    };
  }
}

function getAIHealthStatus() {
  return {
    circuit_open: circuitOpen,
    failure_count: failureCount
  };
}

module.exports = {
  classifyWithAI,
  getAIHealthStatus
};