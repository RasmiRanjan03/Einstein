import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import isAuthed from '../middleware/isAuth.js';

const router = express.Router();
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// STEP 1: Pass the User ID in the 'state' parameter
router.get('/google/url', isAuthed, (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ],
    state: req.user._id.toString(),
    prompt: 'consent'
  });
  res.json({ url });
});

// STEP 2: Receive the code and the ID (state) back
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query; 

  try {
    const { tokens } = await client.getToken(code);
    
    // Use the 'state' (User ID) to find and update the correct user
    await User.findByIdAndUpdate(state, {
      "googleFit.accessToken": tokens.access_token,
      "googleFit.refreshToken": tokens.refresh_token || null,
      "googleFit.isConnected": true,
      "googleFit.connectedAt": new Date()
    });

    res.send("<h1>✓ Google Fit Connected!</h1><p>You can return to Postman now.</p>");
  } catch (error) {
    res.status(500).send("Authentication failed: " + error.message);
  }
});

export default router;