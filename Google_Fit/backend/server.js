import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Import middleware
import { requestLogger, googleFitLogger, errorLogger } from './middleware/logger.js';
import { rateLimiter, googleFitRateLimiter, authRateLimiter } from './middleware/rateLimiter.js';
import { validateGoogleFitRequest, validateLocationData, validateProfileUpdate } from './middleware/requestValidator.js';
import { smartCache } from './middleware/cacheControl.js';
import errorHandler from './middleware/errorHandler.js';

// Import Routes
import userRoute from './routes/UserRoute.js';
import authRoute from './routes/auth.js';
import googleFitRoute from './routes/googlefit.routes.js'; 
import healthRoute from './routes/health.routes.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.GOOGLE_FIT_PORT || 5002;

// --- 1. GLOBAL MIDDLEWARE (ORDER IS CRITICAL) ---
// Request logging (first)
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','http://localhost:5174','http://localhost:8000','http://localhost:5002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiting
app.use(rateLimiter(100, 60 * 1000)); // 100 requests per minute per user

// --- 2. ROUTES WITH MIDDLEWARE ---
app.use('/api/auth', authRateLimiter, authRoute);
app.use('/api/user', userRoute); 
app.use('/api/googlefit', googleFitRateLimiter, googleFitLogger, smartCache, googleFitRoute);
app.use('/api/health', healthRoute);

// Test route
app.get('/api/googlefit/test', (req, res) => {
  res.json({ success: true, message: 'Google Fit backend is working!' });
});

app.get("/", (req, res) => res.send("Eco-Health AI Backend is Live!"));

// --- 3. ERROR HANDLING (LAST) ---
app.use(errorLogger);
app.use(errorHandler);

app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));