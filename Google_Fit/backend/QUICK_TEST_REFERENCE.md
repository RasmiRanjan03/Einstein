# 🚀 QUICK REFERENCE - API Testing (All Routes)

## 📌 SETUP
- **Base URL:** `http://localhost:5000`
- **Server:** Running on port 5000
- **Token:** Save from signup/signin responses

---

## 🔐 AUTHENTICATION (5 routes)

| # | Method | Route | Data | Notes |
|---|--------|-------|------|-------|
| 1 | POST | `/api/user/signup` | `{name, email, password}` | **Get token here** ⭐ |
| 2 | POST | `/api/user/signin` | `{email, password}` | Alternative login |
| 3 | GET | `/api/user/check-auth` | None | Uses cookie token |
| 4 | GET | `/api/user/me` | None | Get full user data |
| 5 | POST | `/api/user/logout` | None | Clear session |

---

## 🏃 FITNESS DATA (8 routes)

| # | Method | Route | Data | Notes |
|---|--------|-------|------|-------|
| 6 | GET | `/api/googlefit/authorize` | None | **Get auth URL** → Open in browser |
| 7 | GET | `/api/googlefit/callback` | Auto | Happens after user authorizes |
| 8 | GET | `/api/googlefit/status` | None | Check if connected ✅ |
| 9 | GET | `/api/googlefit/steps` | None | **Real-time steps** |
| 10 | GET | `/api/googlefit/heart-rate` | None | **Current heart rate** |
| 11 | GET | `/api/googlefit/body-metrics` | None | Weight, height, body fat |
| 12 | GET | `/api/googlefit/sleep` | None | Last 7 days |
| 13 | GET | `/api/googlefit/summary` | None | **All metrics combined** |
| 14 | POST | `/api/googlefit/disconnect` | None | Disconnect Google Fit |

---

## 📍 LOCATION (2 routes)

| # | Method | Route | Data | Notes |
|---|--------|-------|------|-------|
| 15 | POST | `/api/googlefit/location/update` | `{latitude, longitude}` | **Send GPS coords** |
| 16 | GET | `/api/googlefit/location` | None | Get location + weather |

---

## 📊 DASHBOARD (1 route)

| # | Method | Route | Data | Notes |
|---|--------|-------|------|-------|
| 17 | GET | `/api/googlefit/dashboard/realtime` | None | **All data at once** ⭐ |

---

## 👤 PROFILE (2 routes)

| # | Method | Route | Data | Notes |
|---|--------|-------|------|-------|
| 18 | PUT | `/api/user/update-profile` | `{age, height, weight}` | Update profile |
| 19 | GET | `/api/user/health-recommendation` | None | Get AI recommendation |

---

## ✅ TESTING ORDER

```
1️⃣ POST /api/user/signup
   ↓ Save token from response
2️⃣ GET /api/googlefit/authorize
   ↓ Open URL in browser → Authorize
3️⃣ GET /api/googlefit/status
   ↓ Should show isConnected: true
4️⃣ GET /api/googlefit/steps
   ↓ Should show current steps
5️⃣ POST /api/googlefit/location/update
   ↓ Send: {"latitude": 40.7128, "longitude": -74.0060}
6️⃣ GET /api/googlefit/dashboard/realtime
   ↓ Should show ALL data!
```

---

## 📋 SAMPLE DATA TO SEND

### **Signup** (Route #1)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### **Update Location** (Route #15)
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### **Update Profile** (Route #18)
```json
{
  "age": 28,
  "height": 175,
  "weight": 70
}
```

---

## 🔑 REQUIRED HEADERS

**For all protected routes (except signup/signin):**
```
Cookie: token=your_jwt_token_here
```

**For POST/PUT requests:**
```
Content-Type: application/json
```

---

## ✨ EXPECTED RESPONSES

### Success (2xx)
- 200 OK - Data returned
- 201 Created - User registered

### Client Error (4xx)
- 400 Bad Request - Invalid data
- 401 Unauthorized - No/invalid token
- 404 Not Found - Resource doesn't exist

### Server Error (5xx)
- 500 Server Error - API/Database error

---

## 🧪 ENV VARIABLES CHECK

Ensure `.env` has:
```
MONGO_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=jwtJWTjwtJWT
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/googlefit/callback
WEATHER_API_KEY=0336a0001799a2b050c5ddc99f4d0a2c
```

---

## 📥 POSTMAN IMPORT

1. Open Postman
2. Click `File` → `Import`
3. Select `Postman_Testing_Collection.json`
4. Set environment variable `baseUrl = http://localhost:5000`
5. Run tests! 🚀

---

**Total: 19 Fully Functional Endpoints ✅**
