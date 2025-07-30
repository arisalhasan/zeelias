const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE;

// Sends OTP
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const { phone } = data;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await db.collection("otp").doc(phone).set({
      code: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await twilioClient.messages.create({
      body: `Your Ze Elias Barbershop booking code is: ${otp}`,
      from: twilioNumber,
      to: phone,
    });

    return { success: true };
  } catch (err) {
    console.error("OTP Error:", err);
    return { success: false, error: err.message };
  }
});

// Verifies OTP
exports.verifyOTP = functions.https.onCall(async (data, context) => {
  const { phone, code } = data;

  try {
    const doc = await db.collection("otp").doc(phone).get();
    if (!doc.exists) return { success: false, message: "OTP not found" };

    const { code: storedCode, createdAt } = doc.data();

    // Check if OTP is older than 5 minutes
    const now = admin.firestore.Timestamp.now();
    const expired = now.seconds - createdAt.seconds > 300;

    if (expired) return { success: false, message: "OTP expired" };
    if (code !== storedCode) return { success: false, message: "Incorrect code" };

    await db.collection("otp").doc(phone).delete();
    return { success: true };
  } catch (err) {
    console.error("OTP Verify Error:", err);
    return { success: false, error: err.message };
  }
});
