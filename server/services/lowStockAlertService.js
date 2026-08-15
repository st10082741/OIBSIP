/*
==============================================================
              LOW STOCK ALERT STATE SERVICE
==============================================================

Determines:

• Which low-stock items need a NEW email alert.
• Which existing alerts should be reset after restocking.

==============================================================
*/

const LowStockAlert = require("../models/LowStockAlert");

// =============================================================
// GET ITEMS THAT NEED NEW ALERTS
// =============================================================

const getNewLowStockAlerts = async (lowStockItems) => {
  const newAlerts = [];

  for (const item of lowStockItems) {
    const existingAlert = await LowStockAlert.findOne({
      itemId: item.id,
      category: item.category,
    });

    /*
    If no alert exists, this is a new low-stock event.
    */
    if (!existingAlert) {
      newAlerts.push(item);
    }
  }

  return newAlerts;
};

// =============================================================
// RECORD SENT ALERTS
// =============================================================

const recordLowStockAlerts = async (items) => {
  for (const item of items) {
    await LowStockAlert.updateOne(
      {
        itemId: item.id,
        category: item.category,
      },
      {
        $set: {
          itemName: item.name,
          stockAtAlert: item.stock,
          thresholdAtAlert: item.threshold,
        },
      },
      {
        upsert: true,
      },
    );
  }
};

// =============================================================
// RESET RECOVERED ITEMS
// =============================================================

const resetRecoveredAlerts = async (currentLowStockItems) => {
  /*
  Build identifiers for items that are STILL low.
  */

  const activeKeys = new Set(
    currentLowStockItems.map(
      (item) => `${item.category}:${item.id.toString()}`,
    ),
  );

  const existingAlerts = await LowStockAlert.find();

  for (const alert of existingAlerts) {
    const key = `${alert.category}:${alert.itemId.toString()}`;

    /*
    If an existing alerted item is no longer in the
    low-stock results, it has recovered.

    Delete its alert state so it may trigger again
    if stock drops in the future.
    */
    if (!activeKeys.has(key)) {
      await LowStockAlert.deleteOne({
        _id: alert._id,
      });
    }
  }
};

module.exports = {
  getNewLowStockAlerts,
  recordLowStockAlerts,
  resetRecoveredAlerts,
};
