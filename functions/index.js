const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
require("dotenv").config();

admin.initializeApp();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

// Use onRequest instead of onCall
exports.sendBookingSMS = functions.https.onRequest(async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: "Missing phone or message" });
  }

  try {
    await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phone,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SMS send failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
