from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="ClimateHealth AI API")

latest_analysis = {}

# -----------------------------
# Load Models
# -----------------------------
health_model = joblib.load("models/health_risk_model.pkl")
carbon_model = joblib.load("models/carbon_model_food.pkl")
surge_model = joblib.load("models/climate_surge_model.pkl")


# =====================================================
# 1️⃣ HEALTH MODEL
# =====================================================

class HealthInput(BaseModel):
    age: float
    gender: int
    bmi: float
    systolic_bp: float
    diastolic_bp: float
    cholesterol: float
    glucose: float
    smoking: int
    physical_activity: float
    aqi_exposure: float
    heat_exposure: float


@app.post("/predict-health")
def predict_health(data: HealthInput):
    try:
        features = np.array([[
            data.age,
            data.gender,
            data.bmi,
            data.systolic_bp,
            data.diastolic_bp,
            data.cholesterol,
            data.glucose,
            data.smoking,
            data.physical_activity,
            data.aqi_exposure,
            data.heat_exposure
        ]])

        # Get probabilities
        proba = health_model.predict_proba(features)

        # Since it's multi-output, extract probability of class 1
        cardio_risk = float(proba[0][0][1])
        respiratory_risk = float(proba[1][0][1])
        heat_risk = float(proba[2][0][1])

        overall_score = round((cardio_risk + respiratory_risk + heat_risk) / 3, 2)

        def risk_level(score):
            if score < 0.33:
                return "LOW RISK"
            elif score < 0.66:
                return "MODERATE RISK"
            else:
                return "HIGH RISK"

        return {
            "cardiovascular_risk": {
                "probability": round(cardio_risk, 2),
                "level": risk_level(cardio_risk)
            },
            "respiratory_risk": {
                "probability": round(respiratory_risk, 2),
                "level": risk_level(respiratory_risk)
            },
            "heat_vulnerability": {
                "probability": round(heat_risk, 2),
                "level": risk_level(heat_risk)
            },
            "overall_health_score": {
                "score": overall_score,
                "level": risk_level(overall_score)
            }
        }

    except Exception as e:
        return {"error": str(e)}

# =====================================================
# 2️⃣ CARBON MODEL
# =====================================================

class CarbonInput(BaseModel):
    meat_meals_per_week: float
    dairy_consumption: float
    veg_consumption: float
    car_km_per_week: float
    public_transport_km: float
    electricity_kwh: float
    plastic_waste_kg: float


@app.post("/predict-carbon")
def predict_carbon(data: CarbonInput):
    try:
        features = np.array([[
            data.meat_meals_per_week,
            data.dairy_consumption,
            data.veg_consumption,
            data.car_km_per_week,
            data.public_transport_km,
            data.electricity_kwh,
            data.plastic_waste_kg
        ]])

        # Predict annual carbon emission
        carbon_value = float(carbon_model.predict(features)[0])

        # Sustainability score (normalized example logic)
        # Assume 0–3000 kg range for demo
        sustainability_score = round(1 - (carbon_value / 3000), 2)
        sustainability_score = max(0, min(1, sustainability_score))

        def carbon_level(value):
            if value < 1000:
                return "LOW IMPACT"
            elif value < 2000:
                return "MODERATE IMPACT"
            else:
                return "HIGH IMPACT"

        return {
            "annual_carbon_emission_kg": round(carbon_value, 2),
            "impact_level": carbon_level(carbon_value),
            "sustainability_score": sustainability_score
        }

    except Exception as e:
        return {"error": str(e)}

# =====================================================
# 3️⃣ SURGE MODEL
# =====================================================

class SurgeInput(BaseModel):
    avg_temp: float
    humidity: float
    heat_index: float
    aqi: float
    percent_beds_occupied: float
    percent_icu_occupied: float
    prev_admissions: float


@app.post("/predict-surge")
def predict_surge(data: SurgeInput):
    try:
        features = np.array([[
            data.avg_temp,
            data.humidity,
            data.heat_index,
            data.aqi,
            data.percent_beds_occupied,
            data.percent_icu_occupied,
            data.prev_admissions
        ]])

        predicted_value = float(surge_model.predict(features)[0])

        predicted_increase = float(f"{predicted_value:.2f}")

        # Overload probability scaling logic
        overload_probability = float(min(predicted_increase / 30, 1.0))

        def surge_level(value):
            if value < 10:
                return "LOW RISK"
            elif value < 20:
                return "MODERATE RISK"
            else:
                return "HIGH RISK"

        def emergency_status(prob):
            if prob < 0.4:
                return "STABLE"
            elif prob < 0.7:
                return "ALERT"
            else:
                return "CRITICAL"

        return {
            "predicted_ER_increase_percent": predicted_increase,
            "risk_level": surge_level(predicted_increase),
            "overload_probability": overload_probability,
            "emergency_status": emergency_status(overload_probability)
        }

    except Exception as e:
        return {"error": str(e)}
# =====================================================
# ROOT
# =====================================================

@app.get("/")
def home():
    return {"message": "ClimateHealth AI API Running Successfully"}

# For the prescription of the user 

@app.post("/final-prescription")
def final_prescription(
    health_score: float,
    carbon_emission: float,
    overload_probability: float
):
    prescription = []
    alert_message = ""

    # Health Level
    if health_score > 0.66:
        prescription.append("Start 30 minutes daily walking.")
        prescription.append("Reduce processed food and sugar intake.")
        prescription.append("Schedule regular health checkups.")
        alert_message += "High health risk detected. "

    elif health_score > 0.33:
        prescription.append("Increase physical activity 3x per week.")
        prescription.append("Improve diet quality.")
    else:
        prescription.append("Maintain current healthy lifestyle.")

    # Carbon Level
    if carbon_emission > 2000:
        prescription.append("Reduce red meat consumption by 50%.")
        prescription.append("Use public transport more frequently.")
        prescription.append("Reduce electricity usage.")
        alert_message += "High environmental impact detected. "

    elif carbon_emission > 1000:
        prescription.append("Adopt more plant-based meals weekly.")
        prescription.append("Reduce private vehicle use.")
    else:
        prescription.append("Maintain sustainable lifestyle habits.")

    # Surge Risk
    if overload_probability > 0.7:
        prescription.append("Avoid outdoor activity during peak heat hours.")
        prescription.append("Stay hydrated and monitor vulnerable family members.")
        alert_message += "Hospital overload risk is critical. "

    return {
        "alert": alert_message if alert_message else "Stable condition.",
        "prescription_plan": prescription
    }
   
# Combined Endpoint for all analyses and prescription  
@app.post("/analyze")
def analyze(data: dict):
    global latest_analysis

    try:
        # ---------------------
        # Extract user input
        # ---------------------
        health_data = data["health"]
        carbon_data = data["carbon"]
        surge_data = data["surge"]

        # ---------------------
        # HEALTH MODEL
        # ---------------------
        health_features = np.array([[
            health_data["age"],
            health_data["gender"],
            health_data["bmi"],
            health_data["systolic_bp"],
            health_data["diastolic_bp"],
            health_data["cholesterol"],
            health_data["glucose"],
            health_data["smoking"],
            health_data["physical_activity"],
            health_data["aqi_exposure"],
            health_data["heat_exposure"]
        ]])

        health_proba = health_model.predict_proba(health_features)

        cardio = float(health_proba[0][0][1])
        respiratory = float(health_proba[1][0][1])
        heat = float(health_proba[2][0][1])
        overall_health = round((cardio + respiratory + heat) / 3, 2)

        # ---------------------
        # CARBON MODEL
        # ---------------------
        carbon_features = np.array([[
            carbon_data["meat_meals_per_week"],
            carbon_data["dairy_consumption"],
            carbon_data["veg_consumption"],
            carbon_data["car_km_per_week"],
            carbon_data["public_transport_km"],
            carbon_data["electricity_kwh"],
            carbon_data["plastic_waste_kg"]
        ]])

        carbon_value = float(carbon_model.predict(carbon_features)[0])

        # ---------------------
        # SURGE MODEL
        # ---------------------
        surge_features = np.array([[
            surge_data["avg_temp"],
            surge_data["humidity"],
            surge_data["heat_index"],
            surge_data["aqi"],
            surge_data["percent_beds_occupied"],
            surge_data["percent_icu_occupied"],
            surge_data["prev_admissions"]
        ]])

        predicted_increase = float(surge_model.predict(surge_features)[0])
        overload_probability = float(min(predicted_increase / 30.0, 1.0))

        # ---------------------
        # PRESCRIPTION ENGINE
        # ---------------------
        prescription = []
        alerts = []

        if overall_health > 0.66:
            alerts.append("High Health Risk")
            prescription.append("Start daily exercise")
            prescription.append("Reduce processed food")

        if carbon_value > 2000:
            alerts.append("High Environmental Impact")
            prescription.append("Reduce red meat consumption")
            prescription.append("Use public transport")

        if overload_probability > 0.7:
            alerts.append("Hospital Overload Risk Critical")
            prescription.append("Avoid peak heat hours")
            prescription.append("Stay hydrated")

        result = {
            "health_analysis": {
                "cardio_risk": round(cardio, 2),
                "respiratory_risk": round(respiratory, 2),
                "heat_risk": round(heat, 2),
                "overall_health_score": overall_health
            },
            "carbon_analysis": {
                "annual_emission": round(carbon_value, 2)
            },
            "surge_analysis": {
                "predicted_ER_increase": round(predicted_increase, 2),
                "overload_probability": round(overload_probability, 2)
            },
            "alerts": alerts if alerts else ["Stable Condition"],
            "final_prescription": prescription
        }

        latest_analysis = result
        return result

    except Exception as e:
        return {"error": str(e)}
    
@app.get("/dashboard")
def dashboard():
    if not latest_analysis:
        return {"message": "No analysis performed yet."}
    return latest_analysis