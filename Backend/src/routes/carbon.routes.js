import express from 'express';
import { getCarbonPrediction } from '../controller/carbon.controller.js';
const router=express.Router();
router.route("/predict").post(getCarbonPrediction)
export default router;
