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

// Remove /sendOtp endpoint, as OTP is now handled by EmailJS

// You can add other backend endpoints here if needed

// Remove the export for sendOtp
// exports.sendOtp = functions.https.onRequest(app); 