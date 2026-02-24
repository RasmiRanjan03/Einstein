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
import { isGoogleFitAuthenticated, hasValidLocation, canSyncData } from '../middleware/googleFitAuth.js';
import { validateGoogleFitRequest, validateLocationData } from '../middleware/requestValidator.js';

const router = express.Router();

// OAuth flow (basic auth only)
router.get('/authorize', isAuthed, getGoogleFitAuthUrl);
router.get('/callback', handleGoogleFitCallback);

// Fitness Data (Real-time) with enhanced authentication and validation
router.get('/steps', isGoogleFitAuthenticated, validateGoogleFitRequest, canSyncData, getStepsData);
router.get('/heart-rate', isGoogleFitAuthenticated, validateGoogleFitRequest, canSyncData, getHeartRateData);
router.get('/body-metrics', isGoogleFitAuthenticated, validateGoogleFitRequest, getBodyMetrics);
router.get('/sleep', isGoogleFitAuthenticated, validateGoogleFitRequest, getSleepData);
router.get('/blood-pressure', isGoogleFitAuthenticated, validateGoogleFitRequest, getBloodPressure);
router.get('/summary', isGoogleFitAuthenticated, validateGoogleFitRequest, getFitnessSummary);

// Location Services with validation
router.get('/location/detect', isAuthed, detectAndUpdateLocation); // Auto-detect from IP
router.get('/location', isAuthed, validateLocationData, getCurrentLocation); // Get current location

// Real-time Dashboard (Comprehensive Data)
router.get('/dashboard/realtime', isGoogleFitAuthenticated, validateGoogleFitRequest, getRealtimeDashboard);

// Status endpoints
router.get('/status', isAuthed, getConnectionStatus);
router.post('/disconnect', isAuthed, disconnectGoogleFit);

export default router;