import express from "express";
import { signin, signup, logout, checkAuth, updateProfile, getHealthRecommendation } from "../controllers/user.controller.js";
import isAuthed from "../middleware/isAuth.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', isAuthed, logout);
router.get('/check-auth', isAuthed, checkAuth);

// Profile and Health routes
// NOTE: updateProfile only accepts 'age'. Height & Weight are auto-synced from Google Fit
// If not connected to Google Fit, disconnect it first from your account to manually edit height/weight
router.put('/update-profile', isAuthed, updateProfile);
router.get('/health-recommendation', isAuthed, getHealthRecommendation);

// Get current user details (all user data stored in req.user)
router.get('/me', isAuthed, (req, res) => {
    return res.status(200).json({ user: req.user });
});

export default router;