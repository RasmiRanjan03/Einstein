// Request logging middleware for debugging and monitoring
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Log request start
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`, {
        userId: req.user?._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined
    });
    
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        const responseTime = `${duration}ms`;
        
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime})`, {
            userId: req.user?._id,
            success: data?.success,
            dataType: data?.steps ? 'steps' : data?.currentHeartRate ? 'heart_rate' : 'other',
            responseSize: JSON.stringify(data).length
        });
        
        // Call original json method
        return originalJson.call(this, data);
    };
    
    next();
};

// Google Fit specific logger
export const googleFitLogger = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        // Log Google Fit API specific information
        if (req.originalUrl.includes('/api/googlefit/')) {
            console.log(`Google Fit API Call: ${req.method} ${req.originalUrl}`, {
                userId: req.user?._id,
                success: data?.success,
                error: data?.error,
                timestamp: new Date().toISOString(),
                dataType: req.originalUrl.includes('/steps') ? 'steps' :
                         req.originalUrl.includes('/heart-rate') ? 'heart_rate' :
                         req.originalUrl.includes('/sleep') ? 'sleep' :
                         req.originalUrl.includes('/blood-pressure') ? 'blood_pressure' :
                         req.originalUrl.includes('/body-metrics') ? 'body_metrics' : 'other'
            });
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

// Error logger
export const errorLogger = (err, req, res, next) => {
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?._id,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        query: req.query,
        body: req.body
    });
    
    next(err);
};
