import express from 'express';
import { getStoredDashboard } from '../controllers/dashboard.controller.js';

const router = express.Router();

// Get stored dashboard data from database
router.get('/stored', getStoredDashboard);

export default router;
