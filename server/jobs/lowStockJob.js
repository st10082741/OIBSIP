/*
==============================================================
                LOW STOCK SCHEDULED JOB
==============================================================

Automatically checks inventory and sends low-stock
notifications to the administrator.

Duplicate protection:

• First low-stock detection → email sent.
• Item remains low → no duplicate email.
• Item is restocked → alert state resets.
• Item becomes low again → new email may be sent.

==============================================================
*/

const cron = require("node-cron");

const { getLowStockItems } = require("../services/lowStockService");

const { sendLowStockEmail } = require("../services/lowStockEmailService");

const {
  getNewLowStockAlerts,
  recordLowStockAlerts,
  resetRecoveredAlerts,
} = require("../services/lowStockAlertService");

// =============================================================
// START LOW-STOCK JOB
// =============================================================

const startLowStockJob = () => {
  const schedule = process.env.LOW_STOCK_CRON || "0 9 * * *";

  if (!cron.validate(schedule)) {
    console.error("❌ Invalid LOW_STOCK_CRON schedule.");

    return;
  }

  cron.schedule(schedule, async () => {
    try {
      console.log("🔍 Running scheduled low-stock inventory check...");

      // Detect everything currently low.
      const lowStockItems = await getLowStockItems();

      /*
      Clear alert records for items that have recovered.

      This allows them to trigger a future email if
      they become low again.
      */
      await resetRecoveredAlerts(lowStockItems);

      if (lowStockItems.length === 0) {
        console.log(
          "✅ Inventory check complete. No low-stock items detected.",
        );

        return;
      }

      /*
      Remove items that have already generated an alert.
      */
      const newAlerts = await getNewLowStockAlerts(lowStockItems);

      if (newAlerts.length === 0) {
        console.log(
          "ℹ️ Low-stock items detected, but notifications were already sent.",
        );

        return;
      }

      // Send only NEW alerts.
      const result = await sendLowStockEmail(newAlerts);

      if (result.sent) {
        /*
        Record the alert only after the email
        was successfully sent.
        */
        await recordLowStockAlerts(newAlerts);

        console.log(
          `📧 Low-stock email sent for ${newAlerts.length} new item(s).`,
        );
      }
    } catch (error) {
      console.error("❌ Scheduled low-stock check failed:", error.message);
    }
  });

  console.log(`⏰ Low-stock scheduled job started: ${schedule}`);
};

module.exports = {
  startLowStockJob,
};
