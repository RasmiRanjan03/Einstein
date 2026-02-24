import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { google } from 'googleapis';

// Enhanced authentication middleware that also validates Google Fit connection
export const isGoogleFitAuthenticated = async (req, res, next) => {
    try {
        // First check if user is authenticated
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized - No token provided',
                error: 'MISSING_TOKEN'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized - Invalid token',
                error: 'INVALID_TOKEN'
            });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            });
        }

        // Check if Google Fit is connected
        if (!user.googleFit?.isConnected) {
            return res.status(400).json({ 
                success: false,
                message: 'Google Fit not connected. Please connect your account first.',
                error: 'GOOGLE_FIT_NOT_CONNECTED',
                requiresAuth: true
            });
        }

        // Validate Google Fit tokens by attempting a simple API call
        try {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );

            oauth2Client.setCredentials({
                access_token: user.googleFit.accessToken,
                refresh_token: user.googleFit.refreshToken
            });

            // Test the connection with a lightweight API call
            const fitness = google.fitness({ version: 'v1', auth: oauth2Client });
            await fitness.users.dataSources.list({ userId: 'me' });

        } catch (googleError) {
            // Handle token expiration
            if (googleError.code === 401 || googleError.message?.includes('invalid_grant')) {
                // Try to refresh the token
                try {
                    const oauth2Client = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_CLIENT_SECRET,
                        process.env.GOOGLE_REDIRECT_URI
                    );

                    oauth2Client.setCredentials({
                        refresh_token: user.googleFit.refreshToken
                    });

                    const { credentials } = await oauth2Client.refreshAccessToken();
                    
                    // Update user with new tokens
                    await User.findByIdAndUpdate(user._id, {
                        'googleFit.accessToken': credentials.access_token,
                        'googleFit.isConnected': true
                    });

                    // Update user object for this request
                    user.googleFit.accessToken = credentials.access_token;

                } catch (refreshError) {
                    // Refresh failed, user needs to re-authenticate
                    return res.status(401).json({ 
                        success: false,
                        message: 'Google Fit authorization expired. Please reconnect your account.',
                        error: 'GOOGLE_FIT_AUTH_EXPIRED',
                        requiresReauth: true
                    });
                }
            } else {
                // Other Google API errors
                return res.status(502).json({ 
                    success: false,
                    message: 'Google Fit API error. Please try again later.',
                    error: 'GOOGLE_FIT_API_ERROR',
                    details: googleError.message
                });
            }
        }

        // Attach user to request and proceed
        req.user = user;
        next();

    } catch (error) {
        console.error('Google Fit Auth Middleware Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Authentication error',
            error: 'AUTH_ERROR'
        });
    }
};

// Middleware to check if user has valid location data
export const hasValidLocation = (req, res, next) => {
    const { lat, lon } = req.user.profile.location;
    
    if (!lat || !lon || lat === 0 || lon === 0) {
        return res.status(400).json({
            success: false,
            message: 'Location data not available. Please set your location first.',
            error: 'LOCATION_NOT_SET',
            requiresLocation: true
        });
    }
    
    next();
};

// Middleware to validate data sync permissions
export const canSyncData = (req, res, next) => {
    const user = req.user;
    const lastSync = user.healthStats.lastSync;
    const now = new Date();
    
    // Allow sync if never synced or last sync was more than 1 minute ago
    if (!lastSync || (now - new Date(lastSync)) > 60000) {
        return next();
    }
    
    // Check if force sync is requested
    if (req.query.force === 'true') {
        return next();
    }
    
    return res.status(429).json({
        success: false,
        message: 'Data synced recently. Use ?force=true to override.',
        error: 'RECENT_SYNC',
        lastSync: lastSync,
        nextSync: new Date(new Date(lastSync).getTime() + 60000).toISOString()
    });
};
