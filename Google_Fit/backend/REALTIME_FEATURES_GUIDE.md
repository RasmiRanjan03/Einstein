# Real-Time Health Data & Location API Guide

## Overview
This backend now provides **fully functional real-time health data fetching** from Google Fit API and **real-time location services** with weather integration.

---

## 🔐 Authentication Flow

### 1. **User Signup**
```bash
POST /api/user/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "User Registered",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
  "token": "jwt_token_here"
}
```

### 2. **User Signin**
```bash
POST /api/user/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "name": "John Doe",
  "email": "john@example.com",
  "id": "user_id"
}
```

---

## 🏃 Real-Time Fitness Data Endpoints

All endpoints return **fresh data every time** (no caching). Include the JWT token in cookies or Authorization header.

### 1. **Get Real-Time Steps (Today)**
```bash
GET /api/googlefit/steps
```
**Response:**
```json
{
  "success": true,
  "steps": 5432,
  "timestamp": "2026-02-20T10:30:00Z",
  "message": "Real-time steps data"
}
```

### 2. **Get Current Heart Rate**
```bash
GET /api/googlefit/heart-rate
```
**Response:**
```json
{
  "success": true,
  "currentHeartRate": 72,
  "timeline": [...hourly data...],
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### 3. **Get Body Metrics** (Weight, Height, Body Fat)
```bash
GET /api/googlefit/body-metrics
```
**Response:**
```json
{
  "success": true,
  "metrics": {
    "weight": "70.50",
    "height": "175.00",
    "bodyFat": "15.30"
  },
  "timeline": [...historical data...],
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### 4. **Get Sleep Data** (Last 7 Days)
```bash
GET /api/googlefit/sleep
```
**Response:**
```json
{
  "success": true,
  "lastNightSleep": "7.45",
  "timeline": [...7 days data...],
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### 5. **Get Fitness Summary** (Comprehensive Daily Data)
```bash
GET /api/googlefit/summary
```
**Response:**
```json
{
  "success": true,
  "user_metrics": {
    "age": 28,
    "bmi": "23.02",
    "weight": "70.50",
    "height": "175.00"
  },
  "activity_today": {
    "steps": 5432,
    "calories": "320.50",
    "distance": "4.25",
    "currentHeartRate": 72
  },
  "timestamp": "2026-02-20T10:30:00Z",
  "synced": true
}
```

---

## 📍 Real-Time Location Services

### 1. **Update User Location**
Use the browser's Geolocation API to get lat/lon, then send to backend:

```bash
POST /api/googlefit/location/update
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, US",
    "temperature": 15.5,
    "humidity": 65,
    "condition": "Partly Cloudy",
    "timestamp": "2026-02-20T10:30:00Z"
  },
  "savedLocation": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "message": "Location updated in real-time"
}
```

### 2. **Get Current Location** (With Weather)
```bash
GET /api/googlefit/location
```

**Response:**
```json
{
  "success": true,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, US",
    "temperature": 15.5,
    "humidity": 65,
    "condition": "Partly Cloudy",
    "timestamp": "2026-02-20T10:30:00Z"
  },
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

## 📊 Real-Time Dashboard (All Data At Once)

### **Get Comprehensive Real-Time Health Dashboard**
```bash
GET /api/googlefit/dashboard/realtime
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "today": {
      "steps": 5432,
      "calories": "320.50",
      "distance": "4.25",
      "currentHeartRate": 72,
      "heartMinutes": 45,
      "timestamp": "2026-02-20T10:30:00Z"
    },
    "vitals": {
      "weight": 70.50,
      "height": 175.00,
      "bmi": 23.02,
      "currentHeartRate": 72
    },
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "New York, US",
      "temperature": 15.5,
      "humidity": 65,
      "condition": "Partly Cloudy",
      "timestamp": "2026-02-20T10:30:00Z"
    },
    "lastSync": "2026-02-20T10:30:00Z",
    "syncStatus": "real-time"
  }
}
```

---

## 🔗 Google Fit Authorization

### **Step 1: Get Authorization URL**
```bash
GET /api/googlefit/authorize
```
**Response:**
```json
{
  "success": true,
  "url": "https://accounts.google.com/o/oauth2/auth?..."
}
```

### **Step 2: User Authorizes & Gets Callback**
User visits the URL → Redirected to callback → Connection established ✅

### **Step 3: Check Connection Status**
```bash
GET /api/googlefit/status
```
**Response:**
```json
{
  "success": true,
  "isConnected": true,
  "connectedAt": "2026-02-20T09:00:00Z",
  "lastSync": "2026-02-20T10:30:00Z"
}
```

### **Step 4: Disconnect (Optional)**
```bash
POST /api/googlefit/disconnect
```
**Response:**
```json
{
  "success": true,
  "message": "Disconnected from Google Fit"
}
```

---

## 🔑 Environment Variables Required

Ensure your `.env` file contains:
```env
MONGO_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=jwtJWTjwtJWT
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/googlefit/callback
WEATHER_API_KEY=0336a0001799a2b050c5ddc99f4d0a2c
```

---

## 📱 Frontend Integration Example

### Connect to Google Fit:
```javascript
const connectGoogleFit = async (token) => {
  const response = await fetch('http://localhost:5000/api/googlefit/authorize', {
    headers: { 'Cookie': `token=${token}` }
  });
  const { url } = await response.json();
  window.location.href = url; // User opens auth dialog
};
```

### Fetch Real-Time Steps:
```javascript
const getSteps = async (token) => {
  const response = await fetch('http://localhost:5000/api/googlefit/steps', {
    headers: { 'Cookie': `token=${token}` }
  });
  const data = await response.json();
  console.log(`Steps today: ${data.steps}`);
};
```

### Update Location:
```javascript
const updateLocation = async (token) => {
  const position = await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => console.error(err)
    );
  });

  const response = await fetch('http://localhost:5000/api/googlefit/location/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token}`
    },
    body: JSON.stringify({
      latitude: position.latitude,
      longitude: position.longitude
    })
  });
  const data = await response.json();
  console.log('Location updated:', data.location);
};
```

### Get Real-Time Dashboard:
```javascript
const getDashboard = async (token) => {
  const response = await fetch('http://localhost:5000/api/googlefit/dashboard/realtime', {
    headers: { 'Cookie': `token=${token}` }
  });
  const data = await response.json();
  console.log('Dashboard:', data.dashboard);
};
```

---

## 🚀 Key Features

✅ **Real-Time Data Fetching** - No caching, always fresh data  
✅ **Hourly Health Tracking** - Data aggregated hourly for accuracy  
✅ **Location with Weather** - Current location + OpenWeather integration  
✅ **Comprehensive Dashboard** - All health metrics + location in one call  
✅ **Automatic Profile Sync** - All data auto-syncs to MongoDB  
✅ **Error Handling** - Graceful errors with meaningful messages  
✅ **Cache Control** - Proper HTTP headers to prevent caching  

---

## 🧪 Testing with Postman

1. **Signup** → Get JWT token
2. **Connect Google Fit** → Authorize via OAuth
3. **Sync Steps** → Verify real-time data
4. **Update Location** → Send GPS coordinates
5. **Get Dashboard** → Verify all data is current

All endpoints now provide **real-time, synchronized data** with **automatic profile updates**! 🎉
