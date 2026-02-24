const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?._id,
        timestamp: new Date().toISOString()
    });

    // Google Fit API errors
    if (err.code === 401 || err.message?.includes('invalid_grant')) {
        return res.status(401).json({
            success: false,
            message: 'Google Fit authorization expired. Please reconnect.',
            error: 'GOOGLE_FIT_AUTH_EXPIRED'
        });
    }

    // Google Fit quota exceeded
    if (err.code === 429 || err.message?.includes('quota')) {
        return res.status(429).json({
            success: false,
            message: 'Google Fit API quota exceeded. Please try again later.',
            error: 'GOOGLE_FIT_QUOTA_EXCEEDED'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({
            success: false,
            message: `Validation Error: ${message}`,
            error: 'VALIDATION_ERROR'
        });
    }

    // Cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: 'INVALID_ID'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: 'INVALID_TOKEN'
        });
    }

    // Default error
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        error: error.name || 'INTERNAL_ERROR'
    });
};

export default errorHandler;
