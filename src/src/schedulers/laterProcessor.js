const LaterQueue = require("../models/LaterQueue");
const NotificationEvent = require("../models/NotificationEvent");

async function processLaterQueue() {
  console.log("🔄 Checking LATER queue...");

  const now = new Date();

  const pendingItems = await LaterQueue.find({
    status: "PENDING",
    next_attempt_at: { $lte: now }
  });

  for (let item of pendingItems) {
    try {
      // Example logic: upgrade LATER to NOW after delay
      await NotificationEvent.findByIdAndUpdate(item.event_id, {
        classification: "NOW"
      });

      item.status = "PROCESSED";
      await item.save();

      console.log(`✅ Processed Later event ${item.event_id}`);

    } catch (err) {
      item.retry_count += 1;
      item.next_attempt_at = new Date(Date.now() + 60 * 1000); // retry in 1 min
      await item.save();

      console.log(`❌ Failed processing ${item.event_id}`);
    }
  }
}

module.exports = {
  processLaterQueue
};