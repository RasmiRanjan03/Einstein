import { google } from 'googleapis';
import User from '../models/User.js';
import { getAuthenticatedClient } from '../middleware/googleFitAuth.js';
import { saveDashboardData } from './dashboard.controller.js';

const FITNESS_SCOPES = [
    'openid',
    'profile',
    'https://www.googleapis.com/auth/user.birthday.read',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.blood_pressure.read'
];

// --- HELPER: FETCH REAL-TIME LOCATION ---
const fetchLocationData = async (lat, lon) => {
    try {
        const weatherKey = process.env.WEATHER_API_KEY;
        
        // Fetch weather data
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`
        );
        
        if (!weatherRes.ok) throw new Error('Weather API failed');
        const weather = await weatherRes.json();
        
        // Fetch AQI data (Air Quality Index)
        let aqi = null;
        try {
            const aqiRes = await fetch(
                `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherKey}`
            );
            if (aqiRes.ok) {
                const aqiData = await aqiRes.json();
                aqi = aqiData.list?.[0]?.main?.aqi || null;
            }
        } catch (aqiError) {
            console.log('AQI data not available:', aqiError.message);
        }
        
        return {
            latitude: lat,
            longitude: lon,
            city: weather.name || 'Unknown',
            country: weather.sys?.country || 'Unknown',
            address: `${weather.name || 'Unknown'}, ${weather.sys?.country || 'Unknown'}`,
            temperature: weather.main?.temp || 0,
            humidity: weather.main?.humidity || 0,
            condition: weather.weather?.[0]?.main || 'Unknown',
            description: weather.weather?.[0]?.description || 'Unknown',
            windSpeed: weather.wind?.speed || 0,
            pressure: weather.main?.pressure || 0,
            visibility: weather.visibility || 0,
            aqi: aqi,
            aqiDescription: getAQIDescription(aqi),
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Location fetch error:', error);
        return { 
            latitude: lat, 
            longitude: lon, 
            timestamp: new Date(), 
            error: "Weather data unavailable",
            city: 'Unknown',
            country: 'Unknown'
        };
    }
};

// Helper function to get AQI description
const getAQIDescription = (aqi) => {
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Fair';
    if (aqi === 3) return 'Moderate';
    if (aqi === 4) return 'Poor';
    if (aqi === 5) return 'Very Poor';
    return 'Unknown';
};

// --- AUTH ROUTES ---
export const getGoogleFitAuthUrl = (req, res) => {
    const { userId } = req.query;

    // Use the variable from .env. If it's missing, it defaults to 5002.
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5002/api/googlefit/callback";
    
    // DEBUG: Look at your terminal! This will tell us what is actually being sent.
    console.log(">>> Outgoing Redirect URI to Google:", redirectUri);

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri // Use the variable here
    );

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: FITNESS_SCOPES,
        state: userId,
        prompt: 'consent'
    });

    res.status(200).json({ success: true, url });
};

export const handleGoogleFitCallback = async (req, res) => {
    const { code, state } = req.query;
    try {
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        const { tokens } = await oauth2Client.getToken(code);
        await User.findByIdAndUpdate(state, { 'googleFit.accessToken': tokens.access_token, 'googleFit.refreshToken': tokens.refresh_token, 'googleFit.isConnected': true, 'googleFit.connectedAt': new Date() });
        res.send("<button onclick='window.close()'>✅ Connected! Return to app.</button>");
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// --- INDIVIDUAL DATA ROUTES (Fixed for Real-Time) ---

export const getStepsData = async (req, res) => {
    try {
        const auth = await getAuthenticatedClient(req.user._id);
        const fitness = google.fitness({ version: 'v1', auth });
        const now = new Date().getTime();
        const startOfDay = new Date().setHours(0, 0, 0, 0);

        // Fetch today's steps in real-time
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
                bucketByTime: { durationMillis: 3600000 }, // Hourly buckets for more frequent updates
                startTimeMillis: startOfDay,
                endTimeMillis: now
            }
        });

        // Calculate total steps from all hourly buckets
        let totalSteps = 0;
        response.data.bucket?.forEach(bucket => {
            const steps = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
            totalSteps += steps;
        });

        // Update user's database with current steps
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            'healthStats.steps': totalSteps,
            'healthStats.lastSync': new Date()
        }, { new: true });
        
        // Update req.user with latest data
        req.user = updatedUser;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.json({ 
            success: true, 
            steps: totalSteps,
            timestamp: new Date(),
            message: 'Real-time steps data'
        });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
};

export const getHeartRateData = async (req, res) => {
    try {
        const auth = await getAuthenticatedClient(req.user._id);
        const fitness = google.fitness({ version: 'v1', auth });
        const now = new Date().getTime();
        const start = now - (24 * 60 * 60 * 1000);
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }],
                bucketByTime: { durationMillis: 3600000 }, // Hourly buckets
                startTimeMillis: start,
                endTimeMillis: now
            }
        });

        // Get latest heart rate
        const latestHeartRate = response.data.bucket
            ?.slice()
            .reverse()
            .find(b => b.dataset?.[0]?.point?.[0])
            ?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;

        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            'healthStats.heartRate': Math.round(latestHeartRate),
            'healthStats.lastSync': new Date()
        }, { new: true });
        
        // Update req.user with latest data
        req.user = updatedUser;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.json({ 
            success: true, 
            currentHeartRate: Math.round(latestHeartRate),
            timeline: response.data.bucket,
            timestamp: new Date()
        });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
};

export const getBodyMetrics = async (req, res) => {
    try {
        const auth = await getAuthenticatedClient(req.user._id);
        const fitness = google.fitness({ version: 'v1', auth });
        const now = new Date().getTime();
        const lookback = now - (30 * 24 * 60 * 60 * 1000);
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [
                    { dataTypeName: 'com.google.weight' }, 
                    { dataTypeName: 'com.google.height' },
                    { dataTypeName: 'com.google.body.fat.percentage' }
                ],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: lookback,
                endTimeMillis: now
            }
        });

        // Get latest metrics by searching backwards for non-zero values
        const buckets = response.data.bucket || [];
        let weight = 0;
        let height = 0;
        let bodyFat = 0;

        for (let i = buckets.length - 1; i >= 0; i--) {
            const bucket = buckets[i];
            if (!weight && bucket.dataset?.[0]?.point?.[0]) {
                weight = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
            }
            if (!height && bucket.dataset?.[1]?.point?.[0]) {
                // Google Fit returns height in meters, convert to centimeters
                const heightInMeters = bucket.dataset?.[1]?.point?.[0]?.value?.[0]?.fpVal || 0;
                height = heightInMeters * 100; // Store as cm
            }
            if (!bodyFat && bucket.dataset?.[2]?.point?.[0]) {
                bodyFat = bucket.dataset?.[2]?.point?.[0]?.value?.[0]?.fpVal || 0;
            }
            if (weight && height && bodyFat) break; // Found all values, stop searching
        }

        // Save to database
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            'profile.height': height, // Now in centimeters
            'profile.weight': weight,
            'healthStats.lastSync': new Date()
        }, { new: true });
        
        // Update req.user with latest metrics
        req.user = updatedUser;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.json({ 
            success: true, 
            metrics: {
                weight: weight > 0 ? weight.toFixed(2) : 0,
                height: height > 0 ? height.toFixed(2) : 0, // Now in centimeters
                bodyFat: bodyFat > 0 ? bodyFat.toFixed(2) : 0
            },
            timeline: buckets,
            timestamp: new Date()
        });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
};

export const getSleepData = async (req, res) => {
    try {
        const auth = await getAuthenticatedClient(req.user._id);
        const fitness = google.fitness({ version: 'v1', auth });
        const now = new Date().getTime();
        const start = now - (7 * 24 * 60 * 60 * 1000); // Last 7 days
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{ dataTypeName: 'com.google.sleep.segment' }],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: start,
                endTimeMillis: now
            }
        });

        // Calculate last night's sleep
        const lastSleep = response.data.bucket?.slice().reverse()[0]?.dataset?.[0]?.point || [];
        let sleepHours = 0;
        lastSleep.forEach(point => {
            const duration = point.value?.[0]?.intVal || 0;
            sleepHours += duration / (60 * 60 * 1000); // Convert ms to hours
        });

        // Save to database
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            'healthStats.sleepHours': parseFloat(sleepHours.toFixed(2)),
            'healthStats.lastSync': new Date()
        }, { new: true });
        
        // Update req.user with latest sleep data
        req.user = updatedUser;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.json({ 
            success: true, 
            lastNightSleep: sleepHours.toFixed(2),
            timeline: response.data.bucket,
            timestamp: new Date()
        });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
};

// --- BLOOD PRESSURE DATA ---
export const getBloodPressure = async (req, res) => {
    try {
        const auth = await getAuthenticatedClient(req.user._id);
        const fitness = google.fitness({ version: 'v1', auth });
        const now = new Date().getTime();
        const lookback = now - (30 * 24 * 60 * 60 * 1000); // Last 30 days

        let response;
        try {
            response = await fitness.users.dataset.aggregate({
                userId: 'me',
                requestBody: {
                    aggregateBy: [{ dataTypeName: 'com.google.blood_pressure' }],
                    bucketByTime: { durationMillis: 86400000 }, // Daily buckets
                    startTimeMillis: lookback,
                    endTimeMillis: now
                }
            });
        } catch (apiError) {
            // Blood pressure data type not available in Google Fit for this user
            return res.status(200).json({
                success: true,
                bloodPressure: {
                    systolic: 0,
                    diastolic: 0,
                    reading: "Not available",
                    status: "No data",
                    message: "Blood pressure data not available. Please enable blood pressure tracking in your Google Fit app or manually track it.",
                    unit: "mmHg"
                },
                available: false,
                timestamp: new Date()
            });
        }

        // Get latest blood pressure reading (search backwards for latest non-zero)
        const buckets = response.data.bucket || [];
        let systolic = 0;
        let diastolic = 0;
        let readingDate = null;

        for (let i = buckets.length - 1; i >= 0; i--) {
            const bucket = buckets[i];
            if (bucket.dataset?.[0]?.point?.[0]) {
                systolic = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
                diastolic = bucket.dataset?.[0]?.point?.[0]?.value?.[1]?.fpVal || 0;
                readingDate = new Date(parseInt(bucket.startTimeMillis));
                if (systolic && diastolic) break; // Found valid reading
            }
        }

        // Save to database
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            'healthStats.bloodPressure.systolic': Math.round(systolic),
            'healthStats.bloodPressure.diastolic': Math.round(diastolic),
            'healthStats.lastSync': new Date()
        }, { new: true });
        
        // Update req.user with latest blood pressure data
        req.user = updatedUser;

        // Determine blood pressure status
        let status = "Normal";
        if (systolic >= 180 || diastolic >= 120) status = "Crisis";
        else if (systolic >= 140 || diastolic >= 90) status = "High - Stage 2";
        else if (systolic >= 130 && systolic < 140) status = "High - Stage 1";
        else if (systolic >= 120 && systolic < 130) status = "Elevated";
        else if (systolic < 120 && diastolic < 80) status = "Normal";

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.json({
            success: true,
            bloodPressure: {
                systolic: Math.round(systolic),
                diastolic: Math.round(diastolic),
                reading: systolic && diastolic ? `${Math.round(systolic)}/${Math.round(diastolic)} mmHg` : "No readings",
                status: status,
                readingDate: readingDate,
                unit: "mmHg"
            },
            available: systolic && diastolic ? true : false,
            timeline: buckets.map(b => ({
                date: new Date(parseInt(b.startTimeMillis)),
                systolic: b.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0,
                diastolic: b.dataset?.[0]?.point?.[0]?.value?.[1]?.fpVal || 0
            })),
            timestamp: new Date()
        });
    } catch (error) {
        res.status(200).json({ 
            success: true,
            bloodPressure: {
                systolic: 0,
                diastolic: 0,
                reading: "Not available",
                status: "No data",
                message: "Blood pressure data not available from Google Fit. " + error.message,
                unit: "mmHg"
            },
            available: false,
            timestamp: new Date()
        });
    }
};

// --- CONSOLIDATED SUMMARY ---
export const getFitnessSummary = async (req, res) => {
    try {
        const auth = await getAuthenticatedClient(req.user._id);
        const fitness = google.fitness({ version: 'v1', auth });
        const people = google.people({ version: 'v1', auth });
        const now = new Date().getTime();
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const lookback30Days = now - (30 * 24 * 60 * 60 * 1000);

        let age = 0;
        try {
            const person = await people.people.get({ resourceName: 'people/me', personFields: 'birthdays' });
            const bday = person.data.birthdays?.[0]?.date;
            if (bday) age = new Date().getFullYear() - bday.year;
        } catch (e) { console.log("Age fetch error", e.message); }

        // Fetch activity data (steps, calories, heart rate) with hourly buckets
        const activityResponse = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [
                    { dataTypeName: 'com.google.step_count.delta' },
                    { dataTypeName: 'com.google.calories.expended' },
                    { dataTypeName: 'com.google.heart_minutes' },
                    { dataTypeName: 'com.google.heart_rate.bpm' },
                    { dataTypeName: 'com.google.distance.delta' }
                ],
                bucketByTime: { durationMillis: 3600000 }, // Hourly for real-time
                startTimeMillis: lookback30Days,
                endTimeMillis: now
            }
        });

        // Fetch body metrics (weight, height) with daily buckets
        const bodyResponse = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [
                    { dataTypeName: 'com.google.weight' },
                    { dataTypeName: 'com.google.height' }
                ],
                bucketByTime: { durationMillis: 86400000 }, // Daily buckets for body metrics
                startTimeMillis: lookback30Days,
                endTimeMillis: now
            }
        });

        const activityBuckets = activityResponse.data.bucket || [];
        const bodyBuckets = bodyResponse.data.bucket || [];
        
        // Extract today's data from activity buckets
        let totalSteps = 0;
        let totalCalories = 0;
        let totalDistance = 0;
        let currentHeartRate = 0;
        
        // Sum steps and calories from today's buckets
        activityBuckets.filter(b => {
            const bucketTime = parseInt(b.startTimeMillis);
            return bucketTime >= startOfDay;
        }).forEach(bucket => {
            totalSteps += bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
            totalCalories += bucket.dataset?.[1]?.point?.[0]?.value?.[0]?.fpVal || 0;
            totalDistance += bucket.dataset?.[4]?.point?.[0]?.value?.[0]?.fpVal || 0;
        });

        // Get latest heart rate from activity data
        const latestActivityBucket = activityBuckets[activityBuckets.length - 1];
        currentHeartRate = latestActivityBucket?.dataset?.[3]?.point?.[0]?.value?.[0]?.fpVal || 0;

        // Get latest body metrics from body buckets (search backwards)
        let weight = 0;
        let height = 0;
        let systolic = 0;
        let diastolic = 0;
        let hasBloodPressure = false;
        
        for (let i = bodyBuckets.length - 1; i >= 0; i--) {
            const bucket = bodyBuckets[i];
            if (!weight && bucket.dataset?.[0]?.point?.[0]) {
                weight = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
            }
            if (!height && bucket.dataset?.[1]?.point?.[0]) {
                // Google Fit returns height in meters, convert to centimeters
                const heightInMeters = bucket.dataset?.[1]?.point?.[0]?.value?.[0]?.fpVal || 0;
                height = heightInMeters * 100; // Store as cm
            }
            if (weight && height) break; // Found both, stop searching
        }

        // Try to fetch blood pressure separately (optional)
        try {
            const bpResponse = await fitness.users.dataset.aggregate({
                userId: 'me',
                requestBody: {
                    aggregateBy: [{ dataTypeName: 'com.google.blood_pressure' }],
                    bucketByTime: { durationMillis: 86400000 }, // Daily buckets
                    startTimeMillis: lookback30Days,
                    endTimeMillis: now
                }
            });
            
            const bpBuckets = bpResponse.data.bucket || [];
            for (let i = bpBuckets.length - 1; i >= 0; i--) {
                const bucket = bpBuckets[i];
                if (bucket.dataset?.[0]?.point?.[0]) {
                    systolic = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
                    diastolic = bucket.dataset?.[0]?.point?.[0]?.value?.[1]?.fpVal || 0;
                    if (systolic && diastolic) {
                        hasBloodPressure = true;
                        break;
                    }
                }
            }
        } catch (e) {
            console.log('Blood pressure data not available:', e.message);
            // Blood pressure is optional - don't fail the request
        }

        // Calculate BMI (height is already in cm, convert to meters for calculation)
        const heightInMeters = height / 100;
        const bmi = (weight > 0 && heightInMeters > 0) ? (weight / (heightInMeters * heightInMeters)).toFixed(2) : 0;

        // Update user profile with real-time data
        const updateData = {
            'profile.age': age,
            'profile.height': height, // Now in centimeters
            'profile.weight': weight,
            'profile.bmi': bmi,
            'healthStats.steps': totalSteps,
            'healthStats.heartRate': Math.round(currentHeartRate),
            'healthStats.lastSync': new Date()
        };
        
        // Only update blood pressure if we have valid data
        if (hasBloodPressure) {
            updateData['healthStats.bloodPressure.systolic'] = Math.round(systolic);
            updateData['healthStats.bloodPressure.diastolic'] = Math.round(diastolic);
        }
        
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
        
        // Update req.user with latest synced data
        req.user = updatedUser;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Build blood pressure response
        const bloodPressureReading = hasBloodPressure 
            ? `${Math.round(systolic)}/${Math.round(diastolic)}`
            : 'Not available';
        
        res.json({ 
            success: true, 
            user_metrics: { 
                age, 
                bmi, 
                weight: weight.toFixed(2), 
                height: height.toFixed(2) // Now in centimeters
            }, 
            activity_today: { 
                steps: totalSteps,
                calories: totalCalories.toFixed(2),
                distance: (totalDistance / 1000).toFixed(2), // Convert to km
                currentHeartRate: Math.round(currentHeartRate),
                bloodPressure: bloodPressureReading
            },
            timestamp: new Date(),
            synced: true
        });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
};

// --- LOCATION SERVICES ---
// AUTO-DETECT LOCATION from IP and save to database
export const detectAndUpdateLocation = async (req, res) => {
    try {
        // Auto-detect location from IP
        const ipLookup = await fetch('http://ip-api.com/json/');
        const ipData = await ipLookup.json();
        
        if (ipData.status !== 'success') {
            return res.status(400).json({ success: false, error: 'Could not detect location' });
        }

        const { lat, lon } = ipData;

        // Fetch location-based weather data
        const locationData = await fetchLocationData(lat, lon);

        // Update user location in database
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                'profile.location.lat': lat,
                'profile.location.lon': lon
            },
            { new: true }
        );
        
        // Update req.user with latest location
        req.user = updatedUser;

        res.json({ 
            success: true, 
            location: {
                ...locationData,
                savedLocation: updatedUser.profile.location
            },
            message: 'Location auto-detected and saved'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET CURRENT LOCATION (auto-detect if not set)
export const getCurrentLocation = async (req, res) => {
    try {
        let { lat, lon } = req.user.profile.location;

        // If DB is empty (0,0), find "real" location via IP and save it
        if (!lat || !lon || (lat === 0 && lon === 0)) {
            const ipLookup = await fetch('http://ip-api.com/json/');
            const ipData = await ipLookup.json();
            
            if (ipData.status === 'success') {
                lat = ipData.lat;
                lon = ipData.lon;

                // Auto-save this detected location so it's not empty next time
                const updatedUser = await User.findByIdAndUpdate(req.user._id, {
                    'profile.location.lat': lat,
                    'profile.location.lon': lon
                }, { new: true });
                
                // Update req.user
                req.user = updatedUser;
            } else {
                return res.status(404).json({ success: false, error: 'Could not detect location automatically.' });
            }
        }

        const locationData = await fetchLocationData(lat, lon);

        res.json({ 
            success: true, 
            location: locationData,
            source: (lat !== 0 && lon !== 0) ? 'database' : 'ip-detection'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- REAL-TIME HEALTH DASHBOARD ---
export const getRealtimeDashboard = async (req, res) => {
    try {
        // Handle userId from query parameter for direct access
        const { userId } = req.query;
        let user = req.user;
        
        if (userId && !user) {
            // If userId is provided in query, fetch user directly
            user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        }
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User authentication required' });
        }

        const auth = await getAuthenticatedClient(user._id);
        const fitness = google.fitness({ version: 'v1', auth });

        const now = new Date().getTime();
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const lookback7Days = now - (7 * 24 * 60 * 60 * 1000);
        const lookback30Days = now - (30 * 24 * 60 * 60 * 1000); // For body metrics

        // Use default coordinates if location not set
        let lat = user.profile.location?.lat || 20.133073999999997;
        let lon = user.profile.location?.lon || 85.619011;
        
        // If location is still default values, update user location
        if (!user.profile.location?.lat || !user.profile.location?.lon) {
            await User.findByIdAndUpdate(user._id, {
                'profile.location.lat': lat,
                'profile.location.lon': lon
            });
        }

        // Fetch activity data (steps, calories, heart rate) with hourly buckets
        const activityResponse = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [
                    { dataTypeName: 'com.google.step_count.delta' },
                    { dataTypeName: 'com.google.calories.expended' },
                    { dataTypeName: 'com.google.heart_rate.bpm' },
                    { dataTypeName: 'com.google.heart_minutes' },
                    { dataTypeName: 'com.google.distance.delta' }
                ],
                bucketByTime: { durationMillis: 3600000 }, // Hourly buckets for activity
                startTimeMillis: lookback7Days,
                endTimeMillis: now
            }
        });

        // Fetch body metrics (weight, height) with daily buckets (they're daily data)
        const bodyResponse = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [
                    { dataTypeName: 'com.google.weight' },
                    { dataTypeName: 'com.google.height' }
                ],
                bucketByTime: { durationMillis: 86400000 }, // Daily buckets for body metrics
                startTimeMillis: lookback30Days,
                endTimeMillis: now
            }
        });

        // Extract activity data from today's buckets
        const activityBuckets = activityResponse.data.bucket || [];
        const todaysBuckets = activityBuckets.filter(b => parseInt(b.startTimeMillis) >= startOfDay);
        
        let todayStats = {
            steps: 0,
            calories: 0,
            distance: 0,
            currentHeartRate: 0,
            heartMinutes: 0
        };

        todaysBuckets.forEach(bucket => {
            todayStats.steps += bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
            todayStats.calories += bucket.dataset?.[1]?.point?.[0]?.value?.[0]?.fpVal || 0;
            todayStats.distance += bucket.dataset?.[4]?.point?.[0]?.value?.[0]?.fpVal || 0;
            todayStats.heartMinutes += bucket.dataset?.[3]?.point?.[0]?.value?.[0]?.intVal || 0;
        });

        // Get latest heart rate from activity data
        const latestActivityBucket = activityBuckets[activityBuckets.length - 1];
        todayStats.currentHeartRate = latestActivityBucket?.dataset?.[2]?.point?.[0]?.value?.[0]?.fpVal || 0;

        // Get latest body metrics from body data (search for latest non-zero values)
        const bodyBuckets = bodyResponse.data.bucket || [];
        let weight = 0;
        let height = 0;
        let systolic = 0;
        let diastolic = 0;

        // Search backwards through buckets to find latest weight and height
        for (let i = bodyBuckets.length - 1; i >= 0; i--) {
            const bucket = bodyBuckets[i];
            if (!weight && bucket.dataset?.[0]?.point?.[0]) {
                weight = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
            }
            if (!height && bucket.dataset?.[1]?.point?.[0]) {
                // Google Fit returns height in meters, convert to centimeters
                const heightInMeters = bucket.dataset?.[1]?.point?.[0]?.value?.[0]?.fpVal || 0;
                height = heightInMeters * 100; // Store as cm
            }
            if (weight && height) break; // Found both, stop searching
        }

        // Try to fetch blood pressure separately (optional)
        let hasBloodPressure = false;
        try {
            const bpResponse = await fitness.users.dataset.aggregate({
                userId: 'me',
                requestBody: {
                    aggregateBy: [{ dataTypeName: 'com.google.blood_pressure' }],
                    bucketByTime: { durationMillis: 86400000 }, // Daily buckets
                    startTimeMillis: lookback30Days,
                    endTimeMillis: now
                }
            });
            
            const bpBuckets = bpResponse.data.bucket || [];
            for (let i = bpBuckets.length - 1; i >= 0; i--) {
                const bucket = bpBuckets[i];
                if (bucket.dataset?.[0]?.point?.[0]) {
                    systolic = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
                    diastolic = bucket.dataset?.[0]?.point?.[0]?.value?.[1]?.fpVal || 0;
                    if (systolic && diastolic) {
                        hasBloodPressure = true;
                        break;
                    }
                }
            }
        } catch (e) {
            console.log('Blood pressure data not available:', e.message);
            // Blood pressure is optional - don't fail the request
        }

        // Calculate BMI (height is already in cm, convert to meters for calculation)
        const heightInMeters = height / 100;
        const bmi = (weight > 0 && heightInMeters > 0) ? (weight / (heightInMeters * heightInMeters)).toFixed(2) : 0;

        // Get current location data
        let locationData = null;
        if (lat && lon) {
            locationData = await fetchLocationData(lat, lon);
        }

        // Update user with all latest data and get updated user
        const updateData = {
            'healthStats.steps': todayStats.steps,
            'healthStats.calories': todayStats.calories,
            'healthStats.distance': todayStats.distance,
            'healthStats.heartRate': Math.round(todayStats.currentHeartRate),
            'healthStats.heartMinutes': todayStats.heartMinutes,
            'profile.weight': weight,
            'profile.height': height, // Now in centimeters
            'profile.bmi': bmi,
            'profile.location.lat': lat,
            'profile.location.lon': lon,
            'profile.location.city': locationData?.city || 'Unknown',
            'profile.location.country': locationData?.country || 'Unknown',
            'profile.location.address': locationData?.address || 'Unknown',
            'healthStats.lastSync': new Date()
        };
        
        // Update environment data if available
        if (locationData) {
            updateData['environment.temperature'] = locationData.temperature;
            updateData['environment.humidity'] = locationData.humidity;
            updateData['environment.windSpeed'] = locationData.windSpeed;
            updateData['environment.pressure'] = locationData.pressure;
            updateData['environment.visibility'] = locationData.visibility;
            updateData['environment.condition'] = locationData.condition;
            updateData['environment.description'] = locationData.description;
            updateData['environment.aqi'] = locationData.aqi;
            updateData['environment.aqiDescription'] = locationData.aqiDescription;
            updateData['environment.lastWeatherUpdate'] = new Date();
        }
        
        // Only update blood pressure if we have valid data
        if (hasBloodPressure) {
            updateData['healthStats.bloodPressure.systolic'] = Math.round(systolic);
            updateData['healthStats.bloodPressure.diastolic'] = Math.round(diastolic);
        }
        
        const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true });

        // Update blood pressure response
        const bloodPressureResponse = hasBloodPressure 
            ? {
                systolic: Math.round(systolic),
                diastolic: Math.round(diastolic),
                reading: `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`,
                available: true
              }
            : {
                systolic: 0,
                diastolic: 0,
                reading: "Not available",
                status: "No data",
                message: "Enable blood pressure tracking in Google Fit",
                available: false
              };
        
        // Create dashboard response object
        const dashboardResponse = {
            success: true,
            dashboard: {
                today: {
                    steps: todayStats.steps,
                    calories: parseFloat(todayStats.calories.toFixed(2)),
                    distance: parseFloat((todayStats.distance / 1000).toFixed(2)), // km
                    currentHeartRate: Math.round(todayStats.currentHeartRate),
                    heartMinutes: Math.round(todayStats.heartMinutes),
                    timestamp: new Date()
                },
                vitals: {
                    weight: parseFloat(weight.toFixed(2)),
                    height: parseFloat(height.toFixed(2)), // Now in centimeters
                    bmi: parseFloat(bmi),
                    currentHeartRate: Math.round(todayStats.currentHeartRate),
                    bloodPressure: bloodPressureResponse
                },
                location: locationData,
                lastSync: new Date(),
                syncStatus: 'real-time'
            }
        };

        // Save dashboard data to database
        try {
            await saveDashboardData(user._id, dashboardResponse.dashboard);
        } catch (saveError) {
            console.error('Error saving dashboard data:', saveError);
            // Don't fail the request, just log the error
        }
        
        res.json(dashboardResponse);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- MANAGEMENT ---
export const disconnectGoogleFit = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { 
        'googleFit.isConnected': false, 
        'googleFit.accessToken': null,
        'googleFit.refreshToken': null 
    });
    res.json({ success: true, message: "Disconnected from Google Fit" });
};

export const getConnectionStatus = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.json({ 
        success: true, 
        isConnected: user?.googleFit?.isConnected || false,
        connectedAt: user?.googleFit?.connectedAt || null,
        lastSync: user?.healthStats?.lastSync || null
    });
};