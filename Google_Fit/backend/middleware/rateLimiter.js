// Simple in-memory rate limiter for Google Fit API calls
const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 100; // Max requests per minute per user

export const rateLimiter = (maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) => {
    return (req, res, next) => {
        const userId = req.user?._id || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Get or initialize user's request record
        if (!requestCounts.has(userId)) {
            requestCounts.set(userId, { requests: [], lastReset: now });
        }
        
        const userRecord = requestCounts.get(userId);
        
        // Clean old requests outside the window
        userRecord.requests = userRecord.requests.filter(timestamp => timestamp > windowStart);
        
        // Check if user has exceeded limit
        if (userRecord.requests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                error: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000) // seconds
            });
        }
        
        // Add current request timestamp
        userRecord.requests.push(now);
        
        // Set headers for rate limiting info
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': Math.max(0, maxRequests - userRecord.requests.length),
            'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
        });
        
        next();
    };
};

// Stricter rate limiter for expensive Google Fit API calls
export const googleFitRateLimiter = rateLimiter(30, 60 * 1000); // 30 requests per minute

// Rate limiter for authentication endpoints
export const authRateLimiter = rateLimiter(5, 60 * 1000); // 5 requests per minute

// Clean up old records periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    const cutoff = now - (5 * 60 * 1000); // 5 minutes ago
    
    for (const [userId, record] of requestCounts.entries()) {
        // Remove users who haven't made requests in 5 minutes
        if (record.lastReset < cutoff) {
            requestCounts.delete(userId);
        }
    }
}, 5 * 60 * 1000);
