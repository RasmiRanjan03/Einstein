import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middlerware/auth.middleware.js'; // 1. Added protection
import { 
    createDustbin, 
    getAllDustbins, 
    getNearbyDustbins 
} from '../controller/dustbin.controller.js';

const router = express.Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dustbins',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    max_file_size: 5242880 // 5MB limit
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  // Add socket timeout for multer itself
  // Note: Cloudinary upload is handled by multer-storage-cloudinary
});

// Multer error handler middleware
const handleUploadErrors = (err, req, res, next) => {
  if (!err) return next();
  
  console.error('\n❌ UPLOAD ERROR:', err.code || err.name);
  console.error('   Message:', err.message);
  
  // Handle timeout errors
  if (err.name === 'TimeoutError' || err.code === 'TIMEOUT' || err.message?.includes('timeout') || err.message?.includes('Timeout')) {
    console.error('   → Request/Upload timeout - file may be too large or internet too slow');
    return res.status(408).json({ 
      status: 'error', 
      message: 'Upload timed out. Try a smaller image or check your internet connection.' 
    });
  }
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE' || err.code === 'LIMIT_FILE_SIZE') {
      console.error('   → File exceeds 5MB');
      return res.status(400).json({ status: 'error', message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ status: 'error', message: `Upload error: ${err.message}` });
  }
  
  // Cloudinary errors
  if (err.http_code) {
    console.error('   → Cloudinary error:', err.http_code);
    if (err.http_code === 499) {
      return res.status(408).json({ status: 'error', message: 'Cloudinary upload timeout' });
    }
    return res.status(400).json({ status: 'error', message: `Cloudinary error: ${err.message}` });
  }
  
  console.error('   → Unknown error:', err);
  res.status(500).json({ status: 'error', message: 'File upload failed. Please try again.' });
};

// --- ROUTES ---

// 2. PUBLIC: Anyone can view all dustbins on the map
router.get('/', getAllDustbins);

// 3. PRIVATE: Only logged-in users can report/add a new dustbin
// Note: 'protect' must come BEFORE upload to verify user first
router.post('/add', protect, upload.single('image'), handleUploadErrors, createDustbin);

// 4. FIND NEARBY: Uses POST so you can send {lat, lng} in req.body easily
router.post('/get-bin', getNearbyDustbins);

export default router;