require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const notificationRoutes = require("./src/routes/notificationRoutes");
const ruleRoutes = require("./src/routes/ruleRoutes");

const { processLaterQueue } = require("./src/schedulers/laterProcessor");
const { getAIHealthStatus } = require("./src/services/aiService");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/notifications", notificationRoutes);
app.use("/rules", ruleRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Background Scheduler
setInterval(() => {
  console.log("🔄 Checking LATER queue...");
  processLaterQueue();
}, 30000);

// Health Endpoint
app.get("/health", (req, res) => {
  const aiStatus = getAIHealthStatus();

  res.json({
    status: "OK",
    ai_circuit_open: aiStatus.circuit_open,
    ai_failure_count: aiStatus.failure_count,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});