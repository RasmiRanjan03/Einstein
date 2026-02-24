import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Import Routes
import userRoute from './routes/UserRoute.js';
import authRoute from './routes/auth.js';
import googleFitRoute from './routes/googlefit.routes.js'; 

dotenv.config();
connectDB();

const app = express();
const port = process.env.GOOGLE_FIT_PORT || 5002;

// --- 1. MIDDLEWARE (ORDER IS CRITICAL) ---
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','http://localhost:5174','http://localhost:8000','http://localhost:5002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// These two must come BEFORE app.use('/api/user', ...)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- 2. ROUTES ---
app.use('/api/user', userRoute); 
app.use('/api/auth', authRoute);
app.use('/api/googlefit', googleFitRoute);

// Test route
app.get('/api/googlefit/test', (req, res) => {
  res.json({ success: true, message: 'Google Fit backend is working!' });
});

app.get("/", (req, res) => res.send("Eco-Health AI Backend is Live!"));

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));