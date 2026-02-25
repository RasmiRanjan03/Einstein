import axios from 'axios';
import { Health, Carbon } from '../models/healthCarbonEnvironment.model.js';

const FASTAPI_HEALTH_URL = "http://127.0.0.1:8000/predict-health";
const FASTAPI_CARBON_URL = "http://127.0.0.1:8000/predict-carbon";

// --- 1. HEALTH PREDICTION & STORAGE ---
export const getHealthPrediction = async (req, res) => {
    try {
        const { 
            age, gender, bmi, systolic_bp, diastolic_bp, 
            cholesterol, glucose, smoking, physical_activity, 
            aqi_exposure, heat_exposure 
        } = req.body;

        // Forwarding to FastAPI with explicit parsing to ensure numeric types
        const response = await axios.post(FASTAPI_HEALTH_URL, {
            age: parseFloat(age),
            gender: parseInt(gender),
            bmi: parseFloat(bmi),
            systolic_bp: parseFloat(systolic_bp),
            diastolic_bp: parseFloat(diastolic_bp),
            cholesterol: parseFloat(cholesterol),
            glucose: parseFloat(glucose),
            smoking: parseInt(smoking),
            physical_activity: parseFloat(physical_activity),
            aqi_exposure: parseFloat(aqi_exposure),
            heat_exposure: parseFloat(heat_exposure)
        });

        // Save to MongoDB using your Combined Model
        const healthRecord = new Health({
            user: req.user._id, // Set by your protect middleware
            cardiovascular_risk: response.data.cardiovascular_risk,
            respiratory_risk: response.data.respiratory_risk,
            heat_vulnerability: response.data.heat_vulnerability,
            physical_activity_status: {
                // Simple logic: mapping physical activity hours to a percentage of a 10hr goal
                value: Math.min(parseFloat(physical_activity) * 10, 100), 
                label: "Target Progress"
            },
            overall_health_score: response.data.overall_health_score
        });

        await healthRecord.save();
        console.log(healthRecord)
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Health Controller Error:", error.message);
        res.status(error.response?.status || 500).json({ 
            error: "Health prediction/storage failed",
            details: error.response?.data || error.message 
        });
    }
};

// --- 2. CARBON PREDICTION & STORAGE ---
export const getCarbonPrediction = async (req, res) => {
    try {
        const { 
            meat_meals_per_week, 
            dairy_consumption, 
            veg_consumption, 
            car_km_per_week, 
            public_transport_km, 
            electricity_kwh, 
            plastic_waste_kg 
        } = req.body;

        // Forwarding to FastAPI
        const response = await axios.post(FASTAPI_CARBON_URL, {
            meat_meals_per_week: parseFloat(meat_meals_per_week),
            dairy_consumption: parseFloat(dairy_consumption),
            veg_consumption: parseFloat(veg_consumption),
            car_km_per_week: parseFloat(car_km_per_week),
            public_transport_km: parseFloat(public_transport_km),
            electricity_kwh: parseFloat(electricity_kwh),
            plastic_waste_kg: parseFloat(plastic_waste_kg)
        });

        const aiData = response.data;

        // Save to MongoDB using your Combined Model
        const carbonRecord = new Carbon({
            user: req.user._id,
            total_carbon_score: {
                value: aiData.annual_carbon_emission_kg / 1000, // Display as tons
                status: aiData.impact_level
            },
            breakdown: {
                transport: { 
                    value: aiData.transport_tons || 0, 
                    percentage: aiData.transport_pct || 0 
                },
                energy: { 
                    value: aiData.energy_tons || 0, 
                    percentage: aiData.energy_pct || 0 
                },
                food: { 
                    value: aiData.food_tons || 0, 
                    percentage: aiData.food_pct || 0 
                },
                waste: { 
                    value: aiData.waste_tons || 0, 
                    percentage: aiData.waste_pct || 0 
                }
            }
        });

        await carbonRecord.save();
        res.status(200).json(aiData);

    } catch (error) {
        console.error("Carbon Controller Error:", error.message);
        res.status(error.response?.status || 500).json({ 
            error: "Carbon prediction/storage failed",
            details: error.response?.data?.error || error.message
        });
    }
};