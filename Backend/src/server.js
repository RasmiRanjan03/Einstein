import dotenv from 'dotenv';
dotenv.config(); 
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import dustbinRoutes from './routes/dustbin.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.route.js';
import aiRoutes from './routes/ai.routes.js';
import carbon from './routes/carbon.routes.js';
import healthRoute from './routes/health.routes.js';
const app = express();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// ✅ Middleware - CORS must be early
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// ✅ Request timeout middleware for file uploads
app.use((req, res, next) => {
  // Longer timeout for file upload routes
  if (req.path.includes('/dustbins/add') || req.path.includes('/ai/segregate')) {
    // Set very long timeout for uploads (5 minutes)
    const uploadTimeout = 300000; // 300 seconds = 5 minutes
    req.setTimeout(uploadTimeout);
    res.setTimeout(uploadTimeout);
    // Also set socket timeout
    req.socket.setTimeout(uploadTimeout);
    console.log('⏱️ Extended timeout (5min) enabled for upload route:', req.path);
  } else {
    // Normal routes: 30 seconds
    req.setTimeout(30000);
    res.setTimeout(30000);
  }
  next();
});

// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dustbins', dustbinRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/carbon',carbon);
app.use('/api/healths',healthRoute);
// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// ✅ Global Error Handler Middleware (must be last)
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Database Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Database: ${process.env.MONGO_URI}`);
    });
    
    // ✅ Set server timeout for file uploads (5 minutes)
    server.setTimeout(300000); // 300 seconds = 5 minutes
    
    // ✅ Handle timeout events
    server.on('clientError', (err, socket) => {
      console.error('💥 Client Error:', err.code);
      if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
      }
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });