import express from 'express';
import { assessHealthRisk } from '../controllers/health.controller.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Health Risk Assessment endpoint
router.post('/assess-risk', rateLimiter(10, 60 * 1000), assessHealthRisk);

export default router;
