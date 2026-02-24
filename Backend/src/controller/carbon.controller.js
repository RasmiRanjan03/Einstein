import axios from 'axios';



const FASTAPI_URL = "http://127.0.0.1:8000/predict-carbon";

export const getCarbonPrediction = async (req, res) => {
    try {
        // 1. Extract and validate data from the frontend request
        const { 
            meat_meals_per_week, 
            dairy_consumption, 
            veg_consumption, 
            car_km_per_week, 
            public_transport_km, 
            electricity_kwh, 
            plastic_waste_kg 
        } = req.body;

        // 2. Forward the data to the FastAPI Carbon Model
        const response = await axios.post(FASTAPI_URL, {
            meat_meals_per_week: parseFloat(meat_meals_per_week),
            dairy_consumption: parseFloat(dairy_consumption),
            veg_consumption: parseFloat(veg_consumption),
            car_km_per_week: parseFloat(car_km_per_week),
            public_transport_km: parseFloat(public_transport_km),
            electricity_kwh: parseFloat(electricity_kwh),
            plastic_waste_kg: parseFloat(plastic_waste_kg)
        });

        // 3. Return the prediction results to the frontend
        // This includes: annual_carbon_emission_kg, impact_level, and sustainability_score
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Error in Carbon Controller:", error.message);
        res.status(error.response?.status || 500).json({
            error: "Failed to fetch carbon prediction",
            details: error.response?.data?.error || error.message
        });
    }
};

