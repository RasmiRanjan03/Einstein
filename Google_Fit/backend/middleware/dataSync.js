// Data synchronization middleware for real-time and cached data
import User from '../models/User.js';

// In-memory cache for frequently accessed data
const dataCache = new Map();
const CACHE_TTL = {
    STEPS: 30 * 1000,      // 30 seconds
    HEART_RATE: 60 * 1000, // 1 minute
    SLEEP: 5 * 60 * 1000,  // 5 minutes
    BODY_METRICS: 10 * 60 * 1000, // 10 minutes
    LOCATION: 15 * 60 * 1000 // 15 minutes
};

// Cache key generator
const getCacheKey = (userId, dataType, timeRange = 'default') => {
    return `${userId}_${dataType}_${timeRange}`;
};

// Check if cached data is still valid
const isCacheValid = (cacheEntry, ttl) => {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < ttl;
};

// Get cached data or return null
export const getCachedData = (userId, dataType, timeRange = 'default') => {
    const key = getCacheKey(userId, dataType, timeRange);
    const cacheEntry = dataCache.get(key);
    const ttl = CACHE_TTL[dataType.toUpperCase()] || CACHE_TTL.STEPS;
    
    if (isCacheValid(cacheEntry, ttl)) {
        return cacheEntry.data;
    }
    
    // Remove expired cache entry
    dataCache.delete(key);
    return null;
};

// Set cached data
export const setCachedData = (userId, dataType, data, timeRange = 'default') => {
    const key = getCacheKey(userId, dataType, timeRange);
    dataCache.set(key, {
        data,
        timestamp: Date.now()
    });
};

// Middleware to serve cached data for real-time endpoints
export const withCache = (dataType, timeRange = 'default') => {
    return async (req, res, next) => {
        const userId = req.user._id;
        
        // Try to get cached data first
        const cachedData = getCachedData(userId, dataType, timeRange);
        if (cachedData && !req.query.force) {
            return res.json({
                success: true,
                data: cachedData,
                cached: true,
                timestamp: new Date()
            });
        }
        
        // No valid cache, proceed to fetch fresh data
        req.cacheDataType = dataType;
        req.cacheTimeRange = timeRange;
        next();
    };
};

// Middleware to cache response data
export const cacheResponse = () => {
    return (req, res, next) => {
        const originalJson = res.json;
        const userId = req.user._id;
        const dataType = req.cacheDataType;
        const timeRange = req.cacheTimeRange;
        
        res.json = function(data) {
            // Cache successful responses
            if (data.success && dataType) {
                setCachedData(userId, dataType, data, timeRange);
            }
            
            // Add cache metadata to response
            if (data.success) {
                data.cached = false;
                data.cacheExpiry = new Date(Date.now() + (CACHE_TTL[dataType.toUpperCase()] || CACHE_TTL.STEPS)).toISOString();
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
};

// Middleware to sync data with database
export const syncWithDatabase = (dataType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;
            const updateData = {};
            
            // This will be populated by the controller after fetching Google Fit data
            req.syncData = (data) => {
                switch (dataType) {
                    case 'steps':
                        updateData['healthStats.steps'] = data.steps || 0;
                        break;
                    case 'heart_rate':
                        updateData['healthStats.heartRate'] = data.currentHeartRate || 0;
                        break;
                    case 'sleep':
                        updateData['healthStats.sleepHours'] = data.sleepHours || 0;
                        break;
                    case 'blood_pressure':
                        if (data.systolic && data.diastolic) {
                            updateData['healthStats.bloodPressure.systolic'] = data.systolic;
                            updateData['healthStats.bloodPressure.diastolic'] = data.diastolic;
                        }
                        break;
                    case 'body_metrics':
                        if (data.weight) updateData['profile.weight'] = data.weight;
                        if (data.height) updateData['profile.height'] = data.height;
                        break;
                }
                
                updateData['healthStats.lastSync'] = new Date();
            };
            
            // After response, update database
            res.on('finish', async () => {
                if (Object.keys(updateData).length > 0) {
                    try {
                        await User.findByIdAndUpdate(userId, updateData);
                        console.log(`Database synced for ${dataType} - User: ${userId}`);
                    } catch (error) {
                        console.error(`Database sync error for ${dataType}:`, error);
                    }
                }
            });
            
            next();
        } catch (error) {
            console.error('Sync middleware error:', error);
            next();
        }
    };
};

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of dataCache.entries()) {
        const dataType = key.split('_')[1]?.toUpperCase();
        const ttl = CACHE_TTL[dataType] || CACHE_TTL.STEPS;
        
        if (!isCacheValid(entry, ttl)) {
            dataCache.delete(key);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`Cache cleanup: Removed ${cleanedCount} expired entries`);
    }
}, 5 * 60 * 1000); // Run every 5 minutes
