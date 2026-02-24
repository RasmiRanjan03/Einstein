# Backend API - Postman Testing Guide

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require authentication via JWT token stored in cookies.

---

## 1. USER AUTHENTICATION ENDPOINTS

### 1.1 Sign Up
**POST** `/api/user/signup`

**Request Body:**
```json
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
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

---

### 1.2 Sign In
**POST** `/api/user/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "name": "John Doe",
  "email": "john@example.com",
  "id": "user_id"
}
```

---

### 1.3 Check Authentication Status
**GET** `/api/user/check-auth`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "age": 25,
      "height": 180,
      "weight": 75,
      "bmi": 23.15,
      "status": "Balanced",
      "location": { "lat": 0, "lon": 0 }
    },
    "healthStats": {
      "heartRate": 0,
      "steps": 0,
      "lastSync": null
    },
    "googleFit": {
      "isConnected": false
    }
  }
}
```

---

### 1.4 Get Current User
**GET** `/api/user/me`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "user": { /* user object */ }
}
```

---

### 1.5 Logout
**POST** `/api/user/logout`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. USER PROFILE ENDPOINTS

### 2.1 Update User Profile
**PUT** `/api/user/update-profile`

**Headers:**
- Cookie: `token=jwt_token`

**Request Body:**
```json
{
  "age": 25,
  "height": 180,
  "weight": 75,
  "lat": 40.7128,
  "lon": -74.0060
}
```

**Response:**
```json
{
  "message": "Profile updated",
  "user": { /* updated user object */ }
}
```

---

### 2.2 Get Health Recommendation
**GET** `/api/user/health-recommendation?lat=40.7128&lon=-74.0060`

**Headers:**
- Cookie: `token=jwt_token`

**Query Parameters:**
- `lat` (optional) - Latitude for location
- `lon` (optional) - Longitude for location

**Response:**
```json
{
  "coordinates": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "aqi": 2,
  "userStatus": "Balanced",
  "recommendation": "Air is good. Safe for your Balanced profile."
}
```

---

## 3. GOOGLE FIT OAUTH ENDPOINTS

### 3.1 Get Google Fit Authorization URL
**GET** `/api/googlefit/authorize`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "message": "Visit this URL to authorize Google Fit",
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Steps to Use:**
1. Get the URL from this endpoint
2. Visit the URL in your browser
3. Authorize the app to access Google Fit data
4. You'll be redirected to the callback endpoint
5. Check connection status using endpoint 3.7

---

### 3.2 OAuth Callback (Handled Automatically)
**GET** `/api/googlefit/callback?code=...&state=...`

This endpoint is called automatically by Google after authorization.

---

## 4. GOOGLE FIT DATA ENDPOINTS

### 4.1 Get Steps Data (Today)
**GET** `/api/googlefit/steps`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-19",
    "steps": 8764
  }
}
```

---

### 4.2 Get Heart Rate Data (Today)
**GET** `/api/googlefit/heart-rate`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-19",
    "averageHeartRate": 72,
    "measurements": 45
  }
}
```

---

### 4.3 Get Body Metrics (Last 7 Days)
**GET** `/api/googlefit/body-metrics`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "data": {
    "weight": "75.50",
    "height": "1.80",
    "bmi": "23.30",
    "unit": "kg/m"
  }
}
```

---

### 4.4 Get Sleep Data (Last 7 Days)
**GET** `/api/googlefit/sleep`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "data": {
    "averageSleepHours": "7.50",
    "lastSevenDaysTotal": "52.50",
    "recordsFound": 7
  }
}
```

---

### 4.5 Get Fitness Summary (Today)
**GET** `/api/googlefit/summary`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-19",
    "steps": 8764,
    "avgHeartRate": 72,
    "caloriesBurned": "450.50",
    "distanceMeters": "6500.00",
    "connected": true
  }
}
```

---

### 4.6 Get Connection Status
**GET** `/api/googlefit/status`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "connectedAt": "2026-02-19T10:30:00.000Z",
    "hasAccessToken": true,
    "hasRefreshToken": true
  }
}
```

---

### 4.7 Disconnect Google Fit
**POST** `/api/googlefit/disconnect`

**Headers:**
- Cookie: `token=jwt_token`

**Response:**
```json
{
  "success": true,
  "message": "Google Fit disconnected successfully"
}
```

---

## 5. TESTING WORKFLOW

### Complete Test Flow:

1. **Sign Up** - Create a new user
   - POST `/api/user/signup`
   - Save the token from response

2. **Check Auth** - Verify user is authenticated
   - GET `/api/user/check-auth`
   - Use token as cookie

3. **Update Profile** - Add user health metrics
   - PUT `/api/user/update-profile`
   - Include age, height, weight

4. **Get Google Fit Auth URL** - Get authorization link
   - GET `/api/googlefit/authorize`
   - Copy the URL to browser

5. **Authorize Google Fit** - Complete OAuth flow
   - Visit the URL from step 4
   - Grant permissions
   - Get redirected back

6. **Check Connection Status** - Verify Google Fit connection
   - GET `/api/googlefit/status`

7. **Fetch Fitness Data** - Get user's health data
   - GET `/api/googlefit/steps`
   - GET `/api/googlefit/heart-rate`
   - GET `/api/googlefit/body-metrics`
   - GET `/api/googlefit/sleep`
   - GET `/api/googlefit/summary`

8. **Get Health Recommendation** - Get AI-based health tips
   - GET `/api/user/health-recommendation`

---

## 6. ERROR HANDLING

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (if available)"
}
```

Common Error Codes:
- `400` - Bad Request (missing fields, invalid data)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (user/resource not found)
- `500` - Internal Server Error

---

## 7. IMPORTANT NOTES

1. **Authentication**: All endpoints except `/api/user/signup` and `/api/user/signin` require JWT token in cookies
2. **Google Fit**: First connect to Google Fit before accessing any fitness data endpoints
3. **WEATHER_API_KEY**: Required for health recommendations (optional)
4. **Browser Authorization**: Google Fit connection requires browser access to complete OAuth flow
5. **Refresh Tokens**: System automatically handles token refresh for Google Fit API calls

---

## 8. POSTMAN SETUP

### Step 1: Create Collections
- Create a new collection for each endpoint group
- E.g., "Authentication", "Google Fit", "Health"

### Step 2: Set Variables
- Set `base_url` = `http://localhost:5000`
- Set `token` = JWT token from login response

### Step 3: Add Pre-request Scripts
```javascript
// Add this to requests that need authentication
pm.request.headers.add({
  key: "Cookie",
  value: "token=" + pm.globals.get("token")
});
```

### Step 4: Add Tests
```javascript
// Verify response status
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// Save token for next requests
var jsonData = pm.response.json();
if (jsonData.token) {
  pm.globals.set("token", jsonData.token);
}
```

---

## 9. TROUBLESHOOTING

### Google Fit Returns Empty Data
- Make sure you've authorized Google Fit
- Check if your Google account has Google Fit data
- Verify scopes include: fitness.activity.read, fitness.body.read, etc.

### Token Expired
- Sign in again to get new token
- Copy token to Postman globals

### CORS Error
- Verify origin is `http://localhost:5173` (frontend port)
- Check that CORS is enabled in server.js

### MongoDB Connection Error
- Verify MONGO_URI in .env is correct
- Check internet connection for MongoDB Atlas

---

Created: February 19, 2026
Backend Version: 1.0.0
