import express from 'express';
import {
  getGoogleFitAuthUrl,
  handleGoogleFitCallback,
  getStepsData,
  getHeartRateData,
  getBodyMetrics,
  getSleepData,
  getBloodPressure,
  getFitnessSummary,
  disconnectGoogleFit,
  getConnectionStatus,
  detectAndUpdateLocation,
  getCurrentLocation,
  getRealtimeDashboard
} from '../controllers/googlefit.controller.js';
import isAuthed from '../middleware/isAuth.js';

const router = express.Router();

// OAuth flow
router.get('/authorize', getGoogleFitAuthUrl);
router.get('/callback', handleGoogleFitCallback);

// Fitness Data (Real-time)
router.get('/steps', isAuthed, getStepsData);
router.get('/heart-rate', isAuthed, getHeartRateData);
router.get('/body-metrics', isAuthed, getBodyMetrics);
router.get('/sleep', isAuthed, getSleepData);
router.get('/blood-pressure', isAuthed, getBloodPressure);
router.get('/summary', isAuthed, getFitnessSummary);

// Location Services (Auto-detection - NO manual entry)
router.get('/location/detect', isAuthed, detectAndUpdateLocation); // Auto-detect from IP
router.get('/location', isAuthed, getCurrentLocation); // Get current location (auto-detects if not set)

// Real-time Dashboard (Comprehensive Data)
router.get('/dashboard/realtime', isAuthed, getRealtimeDashboard);

// Status
router.get('/status', isAuthed, getConnectionStatus);
router.post('/disconnect', isAuthed, disconnectGoogleFit);

export default router;