// Request validation middleware for Google Fit endpoints
export const validateGoogleFitRequest = (req, res, next) => {
    const { startTime, endTime, dataType } = req.query;
    
    // Validate time range if provided
    if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)',
                error: 'INVALID_DATE_FORMAT'
            });
        }
        
        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: 'Start time must be before end time',
                error: 'INVALID_TIME_RANGE'
            });
        }
        
        // Limit time range to maximum 1 year for performance
        const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
        if (end - start > maxRange) {
            return res.status(400).json({
                success: false,
                message: 'Time range cannot exceed 1 year',
                error: 'TIME_RANGE_TOO_LARGE'
            });
        }
    }
    
    // Validate data type if provided
    const validDataTypes = [
        'steps',
        'heart_rate', 
        'sleep',
        'blood_pressure',
        'body_weight',
        'height',
        'activity'
    ];
    
    if (dataType && !validDataTypes.includes(dataType)) {
        return res.status(400).json({
            success: false,
            message: `Invalid data type. Must be one of: ${validDataTypes.join(', ')}`,
            error: 'INVALID_DATA_TYPE'
        });
    }
    
    next();
};

// Validate location data
export const validateLocationData = (req, res, next) => {
    const { lat, lon } = req.query;
    
    if (lat && lon) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates. Latitude and longitude must be numbers',
                error: 'INVALID_COORDINATES'
            });
        }
        
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: 'Latitude must be between -90 and 90',
                error: 'INVALID_LATITUDE'
            });
        }
        
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: 'Longitude must be between -180 and 180',
                error: 'INVALID_LONGITUDE'
            });
        }
        
        // Attach parsed coordinates to request
        req.parsedLocation = { lat: latitude, lon: longitude };
    }
    
    next();
};

// Validate user profile updates
export const validateProfileUpdate = (req, res, next) => {
    const { age, height, weight } = req.body;
    
    if (age !== undefined) {
        if (!Number.isInteger(age) || age < 1 || age > 120) {
            return res.status(400).json({
                success: false,
                message: 'Age must be an integer between 1 and 120',
                error: 'INVALID_AGE'
            });
        }
    }
    
    if (height !== undefined) {
        if (typeof height !== 'number' || height < 50 || height > 300) {
            return res.status(400).json({
                success: false,
                message: 'Height must be a number between 50 and 300 cm',
                error: 'INVALID_HEIGHT'
            });
        }
    }
    
    if (weight !== undefined) {
        if (typeof weight !== 'number' || weight < 10 || weight > 500) {
            return res.status(400).json({
                success: false,
                message: 'Weight must be a number between 10 and 500 kg',
                error: 'INVALID_WEIGHT'
            });
        }
    }
    
    next();
};
