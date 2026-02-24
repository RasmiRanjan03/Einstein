// backend/routes/ai.routes.js
import express from 'express';
import { getAQI, chatWithAI } from '../controller/ai.controller.js';
import { protect } from '../middlerware/auth.middleware.js';

const router = express.Router();

// Public or Protected depending on your preference
router.get('/aqi', getAQI);
router.post('/chat', protect, chatWithAI);

export default router;