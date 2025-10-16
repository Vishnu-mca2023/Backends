// const express = require("express");
// const router = express.Router();
// const fetch = require("node-fetch"); // Make sure node-fetch v2 is installed: npm i node-fetch@2

// const ACCESS_TOKEN = "EAAS4ATIcbzIBPinLwyBGHXcCn2RXJEbZCYQfT9xz1OFD8APOR4oaShU2pQ7glz6VUq1XTD2fVf1jZAO9Xls2aWsvti2HbMmmZBbL6mHKb3PRGc0dI2oog3S5yszOQgF46Xp92RJaipsOXUFBGFUR2F6rPq6kbsGnZCI8EZCzkZCiTlPH2MMzj1ZCZCwiJYNw6pWlGV09RBOdk3j5o6ey4fq7xB0QAkTZAXHmQCe7XaZCZBg441bAZDZD";
// const PHONE_NUMBER_ID = "760158317189194"; // Use your WhatsApp Business phone number ID

// // Send WhatsApp message endpoint
// router.post("/send", async (req, res) => {
//   try {
//     const { to, message } = req.body; // Example: to="919876543210", message="Hello"

//     if (!to || !message) {
//       return res.status(400).json({ error: "Recipient number and message are required" });
//     }

//     const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         text: { body: message },
//       }),
//     });

//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// });

// module.exports = router;

// const ACCESS_TOKEN = "EAAS4ATIcbzIBPutbwgJb4JERPtpg8DSuLZCWpj3mJcmma9VtniQOwMCebzhuTZArRpikKg3tsmOHvd9BebcUAiW68zjsLo0k9xBCnZADYwZAwGZCvT27Beirv5AcB9zyxySWS2W13CjmrSioYO4qrFflzzqy8UL1YFwSXkvJRRL9fIK89ZAw2ZBua1titWcw5OsuBZB0khzNOAMXfe8wGym9yT2qf6MiBtM1pelLD8JCm1YG9gZDZD";
 
// // Replace with your WhatsApp Business phone number ID
// const PHONE_NUMBER_ID = "1493575845312412";

// Your WhatsApp Business Phone Number ID


  // Example: 760158317189194


 // WhatsApp Business phone number ID

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs");

// Storage setup for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Replace with your working WhatsApp credentials
const ACCESS_TOKEN = "EAAS4ATIcbzIBPutbwgJb4JERPtpg8DSuLZCWpj3mJcmma9VtniQOwMCebzhuTZArRpikKg3tsmOHvd9BebcUAiW68zjsLo0k9xBCnZADYwZAwGZCvT27Beirv5AcB9zyxySWS2W13CjmrSioYO4qrFflzzqy8UL1YFwSXkvJRRL9fIK89ZAw2ZBua1titWcw5OsuBZB0khzNOAMXfe8wGym9yT2qf6MiBtM1pelLD8JCm1YG9gZDZD";
 
const PHONE_NUMBER_ID = "760158317189194";
const PUBLIC_BASE_URL = "https://abcd1234.ngrok.io"; // e.g., ngrok or hosted URL: https://xxxx.ngrok.io

// Send WhatsApp message endpoint
router.post("/send", upload.single("image"), async (req, res) => {
  try {
    const { to, name, price } = req.body;
    if (!to || !name || !price || !req.file) {
      return res.status(400).json({ error: "Missing required fields or image" });
    }

    // Generate public URL for image
    const imageUrl = `${PUBLIC_BASE_URL}/uploads/${req.file.filename}`;

    // WhatsApp API payload for media message
    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "image",
      image: {
        link: imageUrl,
        caption: `Product: ${name}\nPrice: ₹${price}`,
      },
    };

    // Send to WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // Delete uploaded file after sending (optional)
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

module.exports = router;
