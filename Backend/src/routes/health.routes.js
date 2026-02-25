import express from 'express';
import { getHealthPrediction } from '../controller/health.controller.js';
const router=express.Router();
router.route("/predict").post(getHealthPrediction);
export default router;