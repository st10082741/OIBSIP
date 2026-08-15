/*
==============================================================
                  LOW STOCK ALERT MODEL
==============================================================

Stores which inventory items have already triggered
a low-stock notification.

This prevents duplicate emails while an item remains
below its configured threshold.

Once the item is restocked above the threshold,
the alert record is removed so a future low-stock
event can generate a new notification.

==============================================================
*/

const mongoose = require("mongoose");

const lowStockAlertSchema = new mongoose.Schema(
  {
    // Inventory item's MongoDB ID.
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Inventory category.
    category: {
      type: String,
      required: true,
    },

    // Stored for easier administration/debugging.
    itemName: {
      type: String,
      required: true,
    },

    // Stock level when the alert was generated.
    stockAtAlert: {
      type: Number,
      required: true,
    },

    thresholdAtAlert: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
One active alert per inventory item/category.

This protects against duplicate records as well as
duplicate emails.
*/
lowStockAlertSchema.index(
  {
    itemId: 1,
    category: 1,
  },
  {
    unique: true,
  },
);

const LowStockAlert = mongoose.model("LowStockAlert", lowStockAlertSchema);

module.exports = LowStockAlert;
