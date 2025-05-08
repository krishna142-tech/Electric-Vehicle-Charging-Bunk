const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const app = express();

// Allow your Vercel domain and localhost for development
app.use(cors({
  origin: ['https://ampora.vercel.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Example sendOtp endpoint (replace with your actual OTP logic)
app.post('/sendOtp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  // TODO: Implement your OTP sending logic here (e.g., generate OTP, send email/SMS, store OTP)
  // For now, just return success for testing CORS
  return res.status(200).json({ success: true, message: 'OTP sent (mock)' });
});

exports.sendOtp = functions.https.onRequest(app); 