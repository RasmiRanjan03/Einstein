import axios from 'axios';

const FASTAPI_URL = "http://127.0.0.1:8000/predict-health";

export const getHealthPrediction = async (req, res) => {
    try {
        const { 
            age, gender, bmi, systolic_bp, diastolic_bp, 
            cholesterol, glucose, smoking, physical_activity, 
            aqi_exposure, heat_exposure 
        } = req.body;

        // Forwarding to FastAPI
        const response = await axios.post(FASTAPI_URL, {
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

        res.status(200).json(response.data);

    } catch (error) {
        console.error("Error in Health Controller:", error.message);
        res.status(error.response?.status || 500).json({
            error: "Failed to fetch health prediction",
            details: error.response?.data || error.message
        });
    }
};