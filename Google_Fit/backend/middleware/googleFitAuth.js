import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { google } from 'googleapis';

// Enhanced authentication with proper token refresh
export const getAuthenticatedClient = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user?.googleFit?.isConnected) {
            throw new Error('Google Fit not connected');
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Set credentials with refresh token
        oauth2Client.setCredentials({
            access_token: user.googleFit.accessToken,
            refresh_token: user.googleFit.refreshToken
        });

        // Set up automatic token refresh
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                await User.findByIdAndUpdate(userId, { 
                    'googleFit.accessToken': tokens.access_token,
                    'googleFit.isConnected': true 
                });
                console.log(`Token refreshed for user ${userId}`);
            }
        });

        // Test if current token is valid
        try {
            const fitness = google.fitness({ version: 'v1', auth: oauth2Client });
            await fitness.users.dataSources.list({ userId: 'me' });
            return oauth2Client;
        } catch (tokenError) {
            if (tokenError.code === 401 || tokenError.message?.includes('invalid_grant')) {
                // Token expired, try to refresh
                try {
                    const { credentials } = await oauth2Client.refreshAccessToken();
                    await User.findByIdAndUpdate(userId, {
                        'googleFit.accessToken': credentials.access_token,
                        'googleFit.isConnected': true
                    });
                    console.log(`Manual token refresh successful for user ${userId}`);
                    return oauth2Client;
                } catch (refreshError) {
                    // Refresh failed, user needs to re-authenticate
                    await User.findByIdAndUpdate(userId, {
                        'googleFit.isConnected': false,
                        'googleFit.accessToken': null
                    });
                    throw new Error('Google Fit authorization expired. Please reconnect your account.');
                }
            }
            throw tokenError;
        }
    } catch (error) {
        console.error('Google Fit auth error:', error);
        throw error;
    }
};

// Enhanced authentication middleware
export const isGoogleFitAuthenticated = async (req, res, next) => {
    try {
        // Check JWT token first
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

        // Get authenticated client (handles token refresh automatically)
        const authClient = await getAuthenticatedClient(user._id);
        
        // Attach both user and auth client to request
        req.user = user;
        req.googleFitAuth = authClient;
        
        next();
    } catch (error) {
        console.error('Google Fit Auth Middleware Error:', error);
        
        if (error.message.includes('authorization expired')) {
            return res.status(401).json({ 
                success: false,
                message: 'Google Fit authorization expired. Please reconnect your account.',
                error: 'GOOGLE_FIT_AUTH_EXPIRED',
                requiresReauth: true
            });
        }
        
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
