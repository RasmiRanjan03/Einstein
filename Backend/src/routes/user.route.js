import express from 'express';
import { getProfile, updateProfile, deleteProfile,checkauth } from '../controller/user.controller.js';
import { protect } from '../middlerware/auth.middleware.js';

const router = express.Router();

// ✅ All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);
router.get('/checkauth', checkauth);

export default router;
