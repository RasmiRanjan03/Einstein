# Complete API Testing Guide - All Routes & Test Data

## 🔌 Base URL
```
http://localhost:5000
```

---

## 📋 AUTHENTICATION ROUTES

### 1️⃣ **User Signup**
- **Method:** `POST`
- **URL:** `/api/user/signup`
- **Headers:** `Content-Type: application/json`
- **Send Data:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Expected Response:**
```json
{
  "message": "User Registered",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```
- **Status:** ✅ 201 Created

---

### 2️⃣ **User Signin**
- **Method:** `POST`
- **URL:** `/api/user/signin`
- **Headers:** `Content-Type: application/json`
- **Send Data:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Expected Response:**
```json
{
  "token": "jwt_token_here",
  "name": "John Doe",
  "email": "john@example.com",
  "id": "user_id_here"
}
```
- **Status:** ✅ 200 OK
- **Note:** Token is also set in cookies

---

### 3️⃣ **Check Authentication**
- **Method:** `GET`
- **URL:** `/api/user/check-auth`
- **Headers:** 
  - `Cookie: token=your_jwt_token` OR
  - `Authorization: Bearer your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "age": 0,
      "height": 0,
      "weight": 0,
      "bmi": 0,
      "status": "Unknown",
      "location": {
        "lat": 0,
        "lon": 0
      }
    },
    "healthStats": {
      "heartRate": 0,
      "steps": 0,
      "sleepHours": 0,
      "lastSync": null
    },
    "googleFit": {
      "isConnected": false
    }
  }
}
```
- **Status:** ✅ 200 OK

---

### 4️⃣ **Get Current User Info**
- **Method:** `GET`
- **URL:** `/api/user/me`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {...},
    "healthStats": {...},
    "googleFit": {...}
  }
}
```
- **Status:** ✅ 200 OK

---

### 5️⃣ **User Logout**
- **Method:** `POST`
- **URL:** `/api/user/logout`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```
- **Status:** ✅ 200 OK

---

## 🏃 GOOGLE FIT - REAL-TIME FITNESS ROUTES

### 6️⃣ **Get Authorization URL** (Connect Google Fit)
- **Method:** `GET`
- **URL:** `/api/googlefit/authorize`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "url": "https://accounts.google.com/o/oauth2/auth?..."
}
```
- **Status:** ✅ 200 OK
- **Action:** User clicks this URL to authorize Google Fit access

---

### 7️⃣ **Google Fit Callback** (Automatic After Authorization)
- **Method:** `GET`
- **URL:** `/api/googlefit/callback?code=auth_code&state=user_id`
- **Headers:** None needed
- **Send Data:** None
- **Expected Response:** HTML page saying "✅ Connected! Return to app."
- **Status:** ✅ 200 OK
- **Note:** Called automatically by Google after user authorizes

---

### 8️⃣ **Check Connection Status**
- **Method:** `GET`
- **URL:** `/api/googlefit/status`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "isConnected": true,
  "connectedAt": "2026-02-20T09:00:00Z",
  "lastSync": "2026-02-20T10:30:00Z"
}
```
- **Status:** ✅ 200 OK

---

### 9️⃣ **Get Real-Time Steps (Today)**
- **Method:** `GET`
- **URL:** `/api/googlefit/steps`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "steps": 5432,
  "timestamp": "2026-02-20T10:30:00Z",
  "message": "Real-time steps data"
}
```
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes - No caching

---

### 🔟 **Get Current Heart Rate**
- **Method:** `GET`
- **URL:** `/api/googlefit/heart-rate`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "currentHeartRate": 72,
  "timeline": [
    {
      "startTimeMillis": "1708419000000",
      "endTimeMillis": "1708422600000",
      "dataset": [
        {
          "point": [
            {
              "value": [{"fpVal": 72}],
              "originDataSource": {...}
            }
          ]
        }
      ]
    }
  ],
  "timestamp": "2026-02-20T10:30:00Z"
}
```
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes

---

### 1️⃣1️⃣ **Get Body Metrics** (Weight, Height, Body Fat)
- **Method:** `GET`
- **URL:** `/api/googlefit/body-metrics`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "metrics": {
    "weight": "70.50",
    "height": "175.00",
    "bodyFat": "15.30"
  },
  "timeline": [...],
  "timestamp": "2026-02-20T10:30:00Z"
}
```
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes

---

### 1️⃣2️⃣ **Get Sleep Data** (Last 7 Days)
- **Method:** `GET`
- **URL:** `/api/googlefit/sleep`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "lastNightSleep": "7.45",
  "timeline": [...7 days...],
  "timestamp": "2026-02-20T10:30:00Z"
}
```
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes (updates every night)

---

### 1️⃣3️⃣ **Get Fitness Summary** (All Daily Metrics)
- **Method:** `GET`
- **URL:** `/api/googlefit/summary`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
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
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes - Combines all data

---

### 1️⃣4️⃣ **Disconnect Google Fit**
- **Method:** `POST`
- **URL:** `/api/googlefit/disconnect`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "message": "Disconnected from Google Fit"
}
```
- **Status:** ✅ 200 OK

---

## 📍 LOCATION SERVICES - REAL-TIME

### 1️⃣5️⃣ **Update User Location**
- **Method:** `POST`
- **URL:** `/api/googlefit/location/update`
- **Headers:** `Cookie: token=your_jwt_token` & `Content-Type: application/json`
- **Send Data:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
- **Expected Response:**
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
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes - Weather API called immediately

---

### 1️⃣6️⃣ **Get Current Location** (With Weather)
- **Method:** `GET`
- **URL:** `/api/googlefit/location`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
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
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes

---

## 📊 REAL-TIME DASHBOARD

### 1️⃣7️⃣ **Get Complete Real-Time Dashboard**
- **Method:** `GET`
- **URL:** `/api/googlefit/dashboard/realtime`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
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
- **Status:** ✅ 200 OK
- **Real-Time?** ✅ Yes - ALL data at once

---

## 👤 PROFILE ROUTES

### 1️⃣8️⃣ **Update User Profile**
- **Method:** `PUT`
- **URL:** `/api/user/update-profile`
- **Headers:** `Cookie: token=your_jwt_token` & `Content-Type: application/json`
- **Send Data:**
```json
{
  "age": 28,
  "height": 175,
  "weight": 70
}
```
- **Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "age": 28,
      "height": 175,
      "weight": 70,
      "bmi": 22.86,
      "status": "Balanced",
      "location": {
        "lat": 0,
        "lon": 0
      }
    },
    "healthStats": {...},
    "googleFit": {...}
  }
}
```
- **Status:** ✅ 200 OK

---

### 1️⃣9️⃣ **Get Health Recommendation**
- **Method:** `GET`
- **URL:** `/api/user/health-recommendation`
- **Headers:** `Cookie: token=your_jwt_token`
- **Send Data:** None
- **Expected Response:**
```json
{
  "success": true,
  "environment": {
    "city": "New York",
    "aqi": 2
  },
  "user_context": {
    "status": "Balanced",
    "bmi": "22.86"
  },
  "recommendation": "Great news! The air in New York is clean. Since your status is Balanced, a 30-minute walk would be excellent for your health."
}
```
- **Status:** ✅ 200 OK

---

## 🧪 POSTMAN QUICK TEST SEQUENCE

### **Step 1: Signup & Get Token**
```
POST http://localhost:5000/api/user/signup
Body:
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "testpass123"
}
```
**Copy the token from response** ➜ Save as `{{token}}`

---

### **Step 2: Connect Google Fit**
```
GET http://localhost:5000/api/googlefit/authorize
Headers: Cookie: token={{token}}
```
**Copy the URL** ➜ Open in browser ➜ Authorize ✅

---

### **Step 3: Check Connection Status**
```
GET http://localhost:5000/api/googlefit/status
Headers: Cookie: token={{token}}
```

---

### **Step 4: Fetch Real-Time Data**
```
GET http://localhost:5000/api/googlefit/steps
Headers: Cookie: token={{token}}
```

---

### **Step 5: Update Location**
```
POST http://localhost:5000/api/googlefit/location/update
Headers: Cookie: token={{token}}, Content-Type: application/json
Body:
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

---

### **Step 6: Get Full Dashboard**
```
GET http://localhost:5000/api/googlefit/dashboard/realtime
Headers: Cookie: token={{token}}
```

---

## 📝 POSTMAN ENVIRONMENT SETUP

Create a **Postman Environment** with:
```json
{
  "name": "Eco-Health",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "enabled": true
    },
    {
      "key": "userId",
      "value": "",
      "enabled": true
    }
  ]
}
```

Then use: `{{baseUrl}}/api/user/signup` in your URLs

---

## ✅ ERROR HANDLING

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Data returned |
| 201 | Created | User registered |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid/missing token |
| 404 | Not Found | User doesn't exist |
| 500 | Server Error | Google Fit API error |

---

## 🔐 IMPORTANT NOTES

1. **Always include token** in requests (except signup/signin)
2. **Cookie format:** `token=your_jwt_token_here`
3. **Real-time data** is fetched fresh every request
4. **Google Fit must be connected** before fetching health data
5. **Location requires** GPS coordinates (latitude & longitude)
6. **Weather API** requires `.env` WEATHER_API_KEY set

---

All 19 endpoints fully tested and working! 🎉
