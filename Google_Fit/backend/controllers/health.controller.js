// AI Health Risk Assessment Controller
import { validateProfileUpdate } from '../middleware/requestValidator.js';

// AI Risk Assessment Algorithm
export const assessHealthRisk = async (req, res) => {
    try {
        const healthData = req.body;
        
        // Validate input data
        const validation = validateHealthData(healthData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                error: 'VALIDATION_ERROR'
            });
        }

        // Calculate risk scores using AI algorithm
        const riskAssessment = calculateRiskScores(healthData);
        
        // Generate personalized recommendations
        const recommendations = generateRecommendations(healthData, riskAssessment);
        
        // Determine key factors
        const keyFactors = identifyKeyFactors(healthData, riskAssessment);

        const result = {
            overall_score: riskAssessment.overallScore,
            risk_level: riskAssessment.riskLevel,
            cardiovascular_risk: riskAssessment.cardiovascularRisk,
            respiratory_risk: riskAssessment.respiratoryRisk,
            metabolic_risk: riskAssessment.metabolicRisk,
            environmental_risk: riskAssessment.environmentalRisk,
            recommendations,
            key_factors: keyFactors
        };

        res.json({
            success: true,
            data: result,
            message: 'Health risk assessment completed successfully'
        });

    } catch (error) {
        console.error('Health risk assessment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assess health risk',
            error: 'ASSESSMENT_ERROR'
        });
    }
};

// Validate health data input
const validateHealthData = (data) => {
    const required = ['age', 'gender', 'bmi', 'systolic_bp', 'diastolic_bp', 
                     'cholesterol', 'glucose', 'smoking', 'physical_activity', 
                     'aqi_exposure', 'heat_exposure'];
    
    for (const field of required) {
        if (data[field] === undefined || data[field] === null) {
            return { isValid: false, error: `Missing required field: ${field}` };
        }
    }

    // Validate ranges
    if (data.age < 1 || data.age > 120) {
        return { isValid: false, error: 'Age must be between 1 and 120' };
    }
    if (data.bmi < 10 || data.bmi > 50) {
        return { isValid: false, error: 'BMI must be between 10 and 50' };
    }
    if (data.systolic_bp < 60 || data.systolic_bp > 250) {
        return { isValid: false, error: 'Systolic BP must be between 60 and 250' };
    }
    if (data.diastolic_bp < 40 || data.diastolic_bp > 150) {
        return { isValid: false, error: 'Diastolic BP must be between 40 and 150' };
    }
    if (data.cholesterol < 100 || data.cholesterol > 400) {
        return { isValid: false, error: 'Cholesterol must be between 100 and 400 mg/dL' };
    }
    if (data.glucose < 50 || data.glucose > 400) {
        return { isValid: false, error: 'Glucose must be between 50 and 400 mg/dL' };
    }
    if (data.aqi_exposure < 0 || data.aqi_exposure > 500) {
        return { isValid: false, error: 'AQI exposure must be between 0 and 500' };
    }
    if (data.heat_exposure < 0 || data.heat_exposure > 100) {
        return { isValid: false, error: 'Heat exposure must be between 0 and 100' };
    }

    return { isValid: true };
};

// Calculate risk scores using weighted algorithm
const calculateRiskScores = (data) => {
    // Age risk factor (0-100)
    const ageRisk = Math.min((data.age - 20) * 1.5, 100);
    
    // BMI risk factor
    let bmiRisk = 0;
    if (data.bmi < 18.5) bmiRisk = 30; // Underweight
    else if (data.bmi >= 18.5 && data.bmi < 25) bmiRisk = 10; // Normal
    else if (data.bmi >= 25 && data.bmi < 30) bmiRisk = 40; // Overweight
    else bmiRisk = 70; // Obese
    
    // Blood pressure risk
    const bpAvg = (data.systolic_bp + data.diastolic_bp * 2) / 3;
    let bpRisk = 0;
    if (bpAvg < 120) bpRisk = 10;
    else if (bpAvg < 140) bpRisk = 30;
    else if (bpAvg < 160) bpRisk = 60;
    else bpRisk = 85;
    
    // Cholesterol risk
    let cholesterolRisk = 0;
    if (data.cholesterol < 200) cholesterolRisk = 15;
    else if (data.cholesterol < 240) cholesterolRisk = 35;
    else cholesterolRisk = 65;
    
    // Glucose risk
    let glucoseRisk = 0;
    if (data.glucose < 100) glucoseRisk = 10;
    else if (data.glucose < 126) glucoseRisk = 40;
    else glucoseRisk = 75;
    
    // Smoking risk
    const smokingRisk = data.smoking === 'current' ? 80 : 
                       data.smoking === 'former' ? 30 : 5;
    
    // Physical activity risk (inverse - more activity = less risk)
    const activityRisk = data.physical_activity === 'high' ? 10 :
                        data.physical_activity === 'moderate' ? 30 : 60;
    
    // Environmental risks
    const aqiRisk = Math.min((data.aqi_exposure / 500) * 100, 100);
    const heatRisk = Math.min((data.heat_exposure / 100) * 100, 100);

    // Calculate category risks with weights
    const cardiovascularRisk = Math.min(
        (ageRisk * 0.3 + bpRisk * 0.35 + cholesterolRisk * 0.25 + smokingRisk * 0.1), 100
    );
    
    const respiratoryRisk = Math.min(
        (smokingRisk * 0.4 + aqiRisk * 0.35 + ageRisk * 0.15 + activityRisk * 0.1), 100
    );
    
    const metabolicRisk = Math.min(
        (bmiRisk * 0.35 + glucoseRisk * 0.35 + ageRisk * 0.2 + activityRisk * 0.1), 100
    );
    
    const environmentalRisk = Math.min(
        (aqiRisk * 0.6 + heatRisk * 0.4), 100
    );

    // Overall score (weighted average)
    const overallScore = Math.min(
        (cardiovascularRisk * 0.3 + respiratoryRisk * 0.25 + 
         metabolicRisk * 0.25 + environmentalRisk * 0.2), 100
    );

    // Determine risk level
    let riskLevel;
    if (overallScore < 20) riskLevel = 'low';
    else if (overallScore < 40) riskLevel = 'moderate';
    else if (overallScore < 70) riskLevel = 'high';
    else riskLevel = 'very_high';

    return {
        overallScore: Math.round(overallScore),
        riskLevel,
        cardiovascularRisk: Math.round(cardiovascularRisk),
        respiratoryRisk: Math.round(respiratoryRisk),
        metabolicRisk: Math.round(metabolicRisk),
        environmentalRisk: Math.round(environmentalRisk)
    };
};

// Generate personalized recommendations
const generateRecommendations = (data, riskAssessment) => {
    const recommendations = [];
    
    // Cardiovascular recommendations
    if (riskAssessment.cardiovascularRisk > 50) {
        recommendations.push("Schedule a cardiovascular checkup with your doctor soon.");
        if (data.systolic_bp > 140 || data.diastolic_bp > 90) {
            recommendations.push("Monitor your blood pressure daily and consider reducing sodium intake.");
        }
        if (data.cholesterol > 240) {
            recommendations.push("Adopt a heart-healthy diet low in saturated fats and high in fiber.");
        }
    }
    
    // Respiratory recommendations
    if (riskAssessment.respiratoryRisk > 50) {
        if (data.smoking === 'current') {
            recommendations.push("Consider quitting smoking - it's the most effective way to improve respiratory health.");
        }
        if (data.aqi_exposure > 150) {
            recommendations.push("Limit outdoor activities on high AQI days and consider using an air purifier indoors.");
        }
    }
    
    // Metabolic recommendations
    if (riskAssessment.metabolicRisk > 50) {
        if (data.bmi > 30) {
            recommendations.push("Focus on gradual weight loss through balanced diet and regular exercise.");
        }
        if (data.glucose > 126) {
            recommendations.push("Monitor blood glucose levels regularly and reduce refined carbohydrate intake.");
        }
        if (data.physical_activity === 'low') {
            recommendations.push("Aim for at least 150 minutes of moderate-intensity exercise per week.");
        }
    }
    
    // Environmental recommendations
    if (riskAssessment.environmentalRisk > 50) {
        if (data.heat_exposure > 60) {
            recommendations.push("Stay hydrated and avoid prolonged sun exposure during peak hours.");
        }
        if (data.aqi_exposure > 100) {
            recommendations.push("Wear a mask when outdoors during poor air quality days.");
        }
    }
    
    // General health recommendations
    if (riskAssessment.overallScore > 40) {
        recommendations.push("Schedule a comprehensive health checkup within the next month.");
    }
    
    // Age-specific recommendations
    if (data.age > 50) {
        recommendations.push("Consider regular health screenings appropriate for your age group.");
    }
    
    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
        recommendations.push(
            "Maintain your current healthy lifestyle with regular exercise and balanced nutrition.",
            "Continue monitoring your health metrics periodically.",
            "Stay updated with preventive health screenings."
        );
    }
    
    return recommendations.slice(0, 6); // Limit to 6 recommendations
};

// Identify key factors affecting health
const identifyKeyFactors = (data, riskAssessment) => {
    const factors = [];
    
    // Add factors based on risk assessment
    if (riskAssessment.environmentalRisk > 40) {
        factors.push({
            factor: "Air Quality Impact",
            impact: "negative",
            value: Math.round(riskAssessment.environmentalRisk)
        });
    }
    
    if (data.heat_exposure > 50) {
        factors.push({
            factor: "Heat Stress",
            impact: "negative", 
            value: data.heat_exposure
        });
    }
    
    if (riskAssessment.cardiovascularRisk > 40) {
        factors.push({
            factor: "Cardiovascular Risk",
            impact: "negative",
            value: Math.round(riskAssessment.cardiovascularRisk)
        });
    }
    
    if (data.physical_activity === 'high') {
        factors.push({
            factor: "Physical Activity",
            impact: "positive",
            value: 85
        });
    } else {
        factors.push({
            factor: "Physical Activity",
            impact: "negative",
            value: data.physical_activity === 'moderate' ? 40 : 70
        });
    }
    
    // Sort by impact value (highest first)
    factors.sort((a, b) => b.value - a.value);
    
    return factors.slice(0, 4); // Return top 4 factors
};