/*
==============================================================
                LOW STOCK EMAIL SERVICE
==============================================================

Sends an automated inventory warning to the administrator
when one or more items reach their configured threshold.
==============================================================
*/

const nodemailer = require("nodemailer");

// =============================================================
// EMAIL TRANSPORTER
// =============================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================================================
// SEND LOW-STOCK EMAIL
// =============================================================

const sendLowStockEmail = async (lowStockItems) => {
  if (!lowStockItems || lowStockItems.length === 0) {
    return {
      sent: false,
      reason: "No low-stock items.",
    };
  }

  /*
  Build a readable inventory list for the administrator.
  */

  const inventoryList = lowStockItems
    .map(
      (item) =>
        `${item.category}: ${item.name}
Stock: ${item.stock} ${item.unit}
Threshold: ${item.threshold} ${item.unit}`,
    )
    .join("\n\n");

  const message = `
Pizza Delivery Inventory Alert

The following inventory item(s) require attention:

${inventoryList}

Please review and restock these items from the admin inventory dashboard.

This is an automated inventory notification.
`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    /*
    ADMIN_EMAIL lets us send inventory alerts somewhere
    different from the application's sender account.
    */

    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,

    subject: `Low Stock Alert - ${lowStockItems.length} Item(s)`,

    text: message,
  });

  return {
    sent: true,
    count: lowStockItems.length,
  };
};

module.exports = {
  sendLowStockEmail,
};
