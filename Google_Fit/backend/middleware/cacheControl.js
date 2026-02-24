// Cache control middleware for real-time data
export const noCache = (req, res, next) => {
    // Set headers to prevent caching for real-time data
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    next();
};

// Cache control for static data (longer cache)
export const staticCache = (maxAge = 300) => { // 5 minutes default
    return (req, res, next) => {
        res.set({
            'Cache-Control': `public, max-age=${maxAge}`,
            'ETag': Date.now().toString()
        });
        next();
    };
};

// Conditional cache based on data type
export const smartCache = (req, res, next) => {
    const url = req.originalUrl;
    
    // Real-time endpoints - no cache
    if (url.includes('/steps') || 
        url.includes('/heart-rate') || 
        url.includes('/dashboard/realtime')) {
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }
    // Historical data - short cache
    else if (url.includes('/sleep') || 
             url.includes('/body-metrics') || 
             url.includes('/blood-pressure')) {
        res.set({
            'Cache-Control': 'public, max-age=60', // 1 minute
            'ETag': Date.now().toString()
        });
    }
    // Profile/status data - medium cache
    else if (url.includes('/status') || 
             url.includes('/location')) {
        res.set({
            'Cache-Control': 'public, max-age=300', // 5 minutes
            'ETag': Date.now().toString()
        });
    }
    
    next();
};
