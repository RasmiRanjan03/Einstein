import express from 'express';
import { 
    getHealthPrediction, 
    getCarbonPrediction 
} from '../controller/healthCarbonEnvironment.controllers.js';
import { protect } from '../middlerware/auth.middleware.js';

const router = express.Router();


router.use(protect);

router.post('/health/predict', getHealthPrediction);
router.post('/carbon/predict', getCarbonPrediction);

export default router;