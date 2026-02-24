import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import axios from 'axios';

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All inputs are required' });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User with this email id already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, 
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });

        res.status(201).json({
            message: 'User Registered',
            user: { id: newUser._id, name, email },
            token
        });
    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Password mismatched' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: false
        });

        return res.status(200).json({ token, name: user.name, email: user.email, id: user._id });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { age, height, weight } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Only allow age update
        if (age) user.profile.age = age;
        
        // Height and Weight: Only allow manual entry if NOT connected to Google Fit
        if (!user.googleFit?.isConnected) {
            if (height) user.profile.height = height;
            if (weight) user.profile.weight = weight;
        } else {
            return res.status(400).json({ 
                message: "Height and weight are auto-synced from Google Fit. Please disconnect Google Fit to manually edit these fields.",
                googleFitConnected: true
            });
        }

        await user.save();
        
        // Update req.user with latest data
        const updatedUser = await User.findById(req.user._id).select('-password');
        req.user = updatedUser;
        
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHealthRecommendation = async (req, res) => {
    try {
        // 1. Get User Location (auto-detect if not set)
        let lat = req.user.profile.location?.lat || 0;
        let lon = req.user.profile.location?.lon || 0;
        
        // Auto-detect location if not set
        if (!lat || !lon || (lat === 0 && lon === 0)) {
            const ipLookup = await axios.get('http://ip-api.com/json/');
            if (ipLookup.data.status === 'success') {
                lat = ipLookup.data.lat;
                lon = ipLookup.data.lon;
                
                // Auto-save detected location
                await User.findByIdAndUpdate(req.user._id, {
                    'profile.location.lat': lat,
                    'profile.location.lon': lon
                });
            }
        }

        // 2. Get AQI from location
        const weatherKey = process.env.WEATHER_API_KEY;
        const aqiRes = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherKey}`);
        const cityRes = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}`);
        const aqi = aqiRes.data.list[0].main.aqi;
        const city = cityRes.data.name;

        // 3. Use req.user data (all details stored from Google Fit or database)
        const status = req.user.profile.status || "Normal";
        const bmi = req.user.profile.bmi || "Unknown";
        const weight = req.user.profile.weight || "Not set";
        const height = req.user.profile.height*100 || "Not set";

        // 4. AI Logic
        let recommendation = "";
        if (aqi >= 4) {
            recommendation = `The Air Quality Index is ${aqi} (Poor) in ${city}. `;
            recommendation += (status === "Overweight" || status === "Obese") 
                ? "Since your profile is at higher risk, please avoid outdoor exercise and use an air purifier."
                : "It is recommended to wear a mask if you are heading outside.";
        } else {
            recommendation = `Great news! The air in ${city} is clean. Since your status is ${status}, a 30-minute walk would be excellent for your health.`;
        }

        res.json({
            success: true,
            environment: { city, lat, lon, aqi },
            user_context: { 
                status, 
                bmi, 
                weight: `${weight} kg`,
                height: `${height} cm`,
                googleFitConnected: req.user.googleFit?.isConnected || false
            },
            recommendation
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        // req.user already contains all user details from middleware
        res.status(200).json({ 
            authenticated: true, 
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                profile: req.user.profile,
                healthStats: req.user.healthStats,
                googleFit: {
                    isConnected: req.user.googleFit?.isConnected || false,
                    connectedAt: req.user.googleFit?.connectedAt || null
                },
                eco: {
                    points: req.user.points,
                    savedCO2: req.user.savedCO2
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};