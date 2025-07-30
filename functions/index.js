const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
require("dotenv").config(); // Load variables from .env

admin.initializeApp();

// ✅ Use environment variables securely
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE; // Also from .env

// 📲 Cloud Function to send SMS
exports.sendBookingSMS = functions.https.onCall(async (data, context) => {
  const { phone, message } = data;

  try {
    await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phone,
    });
    return { success: true };
  } catch (error) {
    console.error("SMS send failed:", error);
    return { success: false, error: error.message };
  }
});
