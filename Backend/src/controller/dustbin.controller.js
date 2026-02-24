import Dustbin from '../models/dustbin.model.js';

export const getAllDustbins = async (req, res) => {
  try {
    console.log('🔄 [GET /api/dustbins] Fetching all dustbins...');
    const bins = await Dustbin.find().sort({ createdAt: -1 });
    console.log('✅ Found', bins.length, 'dustbins');
    console.log('📊 Data:', bins);
    res.status(200).json(bins);
  } catch (error) {
    console.error('❌ Error fetching dustbins:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createDustbin = async (req, res) => {
  try {
    console.log('\n📤 [POST /api/dustbins/add] Creating dustbin...');
    const { name, lat, lng, reportedBy } = req.body;
    console.log('📋 Request body:', { name, lat, lng, reportedBy });
    console.log('📸 File:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'MISSING');
    
    if (!req.file) {
      console.warn('❌ VALIDATION: No file uploaded');
      return res.status(400).json({ status: 'error', message: 'Photo is mandatory!' });
    }

    if (!name || !lat || !lng) {
      console.warn('❌ VALIDATION: Missing fields -', { name, lat, lng });
      return res.status(400).json({ status: 'error', message: 'Name, latitude, and longitude are required' });
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      console.warn('❌ VALIDATION: Invalid coordinates');
      return res.status(400).json({ status: 'error', message: 'Coordinates must be valid numbers' });
    }

    const newBin = await Dustbin.create({
      name: name.trim(),
      lat: parsedLat,
      lng: parsedLng,
      reportedBy: reportedBy?.trim() || 'Anonymous',
      imageUrl: req.file.path
    });
    console.log('✅ SUCCESS - Created:', newBin._id);
    res.status(201).json({ status: 'success', message: 'Dustbin added successfully!', data: newBin });
  } catch (error) {
    console.error('\n❌ ERROR:', error.name, '-', error.message);
    
    if (error.http_code === 499 || error.name === 'TimeoutError') {
      return res.status(408).json({ status: 'error', message: 'Image upload timed out. Try a smaller image.' });
    }
    if (error.http_code === 401) {
      return res.status(503).json({ status: 'error', message: 'Image service authentication failed.' });
    }
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      return res.status(503).json({ status: 'error', message: 'Cannot reach image upload service.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: 'Invalid data provided' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'Dustbin already exists at this location' });
    }
    
    res.status(500).json({ status: 'error', message: 'Server error - please try again' });
  }
};

export const getNearbyDustbins = async (req, res) => {
  try {
    console.log('📍 [POST /api/dustbins/get-bin] Fetching nearby dustbins...');
    const { lat, lng } = req.body;
    console.log('📍 User location:', { lat, lng });
    
    if (!lat || !lng) return res.status(400).json({ message: 'Coordinates required' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const range = 0.015; // Roughly 1.5km range

    const bins = await Dustbin.find({
      lat: { $gte: userLat - range, $lte: userLat + range },
      lng: { $gte: userLng - range, $lte: userLng + range }
    });
    console.log('✅ Found', bins.length, 'nearby dustbins within', range, 'degrees');
    console.log('📊 Data:', bins);
    res.status(200).json(bins);
  } catch (error) {
    console.error('❌ Error fetching nearby dustbins:', error.message);
    res.status(500).json({ message: error.message });
  }
};