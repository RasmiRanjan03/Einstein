# Code Changes Summary - User Data Management & Auto-Sync

## Overview
All user details are now stored in `req.user` and automatically synced from Google Fit. Manual entry is removed for height, weight, and location - with fallback to manual entry only when Google Fit is NOT connected.

---

## Key Changes

### 1. **User Controller** (`controllers/user.controller.js`)

#### `updateProfile()` - Modified
- **Change**: Height and weight NO LONGER accept manual entry if Google Fit is connected
- **Behavior**:
  - ✅ Only age can be manually updated
  - ✅ If Google Fit is connected → height/weight are auto-synced (manual edit blocked)
  - ✅ If Google Fit is NOT connected → height/weight can be manually entered
  - Returns 400 error if trying to update height/weight while Google Fit is active

#### `getHealthRecommendation()` - Updated
- **Change**: Now uses `req.user` (all data available from middleware)
- **New Features**:
  - Auto-detects location from IP if not set
  - Auto-saves detected location to database
  - Uses `req.user.profile` for all user data (weight, height, bmi, status)
  - Displays Google Fit connection status in response
- **Response Include**: city, lat, lon, aqi, weight, height, googleFitConnected flag

#### `checkAuth()` - Updated
- **Change**: Uses `req.user` directly instead of fetching from DB
- **Response**: Returns complete user object including:
  - Profile (age, height, weight, bmi, status, location)
  - healthStats (heartRate, steps, sleepHours, lastSync)
  - googleFit status
  - eco data (points, savedCO2)

---

### 2. **Google Fit Controller** (`controllers/googlefit.controller.js`)

#### All Data Sync Functions Updated
These functions now update `req.user` immediately after syncing:
- `getStepsData()`
- `getHeartRateData()`
- `getBodyMetrics()` - Now auto-saves height & weight to database
- `getSleepData()`
- `getFitnessSummary()`
- `getRealtimeDashboard()`

**Pattern**: 
```javascript
// Save to database and update req.user
const updatedUser = await User.findByIdAndUpdate(req.user._id, {...}, { new: true });
req.user = updatedUser;  // ← req.user is now up-to-date
```

#### Location Functions Refactored
- **Removed**: `updateUserLocation()` - No manual location entry
- **Added**: `detectAndUpdateLocation()` - Auto-detect from IP only
- **Updated**: `getCurrentLocation()` - Auto-detects if location not set

**New Location Flow**:
1. Check if location is saved in DB
2. If empty/zero → Auto-detect from IP
3. Auto-save detected location
4. Return location data + source flag

#### `getRealtimeDashboard()` - Major Update
- Auto-detects location if not set
- Uses `req.user` instead of fetching user separately
- Updates `req.user` with latest synced data
- Returns comprehensive health dashboard with all data synced from Google Fit

---

### 3. **Routes** 

#### Google Fit Routes (`routes/googlefit.routes.js`)
- **Removed**: `POST /location/update` - No manual location entry
- **Added**: `GET /location/detect` - Auto-detect and save location
- **Updated**: `GET /location` - Gets current location (auto-detects if needed)

#### User Routes (`routes/UserRoute.js`)
- **Updated**: Comments clarify that height/weight are auto-synced from Google Fit
- **Clarified**: Manual entry only allowed when Google Fit is disconnected

---

### 4. **Middleware** (`middleware/isAuth.js`)
- **Already Configured**: Correctly stores complete user data in `req.user`
- All user details available: profile, healthStats, googleFit, eco data

---

## Data Flow

### For Height & Weight
```
Google Fit Connected:
  GET /health/body-metrics 
  → Fetch latest from Google Fit API
  → Auto-save to user.profile
  → Update req.user
  → Return updated metrics

Google Fit NOT Connected:
  PUT /user/update-profile (with height, weight)
  → Manual entry allowed
  → Validate & save
  → Return updated profile
```

### For Location
```
GET /health/location
  → Check user.profile.location
  → If empty/zero:
    → Auto-detect from IP API
    → Auto-save to database
    → Update req.user
  → Get weather data for location
  → Return location info + source

Alternative:
GET /health/location/detect
  → Force auto-detect from IP
  → Auto-save
  → Return location info
```

### For All Health Data
```
Every Sync Function:
  1. Fetch from Google Fit API
  2. Save to database (User model)
  3. Update req.user with latest data
  4. Return response with synced data
  
Result: req.user always contains latest data
```

---

## API Examples

### Get Current User (All Details)
```
GET /user/me
Response:
{
  user: {
    _id: "...",
    name: "John",
    email: "john@example.com",
    profile: {
      age: 25,
      height: 180,
      weight: 75,
      bmi: 23.15,
      status: "Balanced",
      location: { lat: 40.7128, lon: -74.0060 }
    },
    healthStats: {
      heartRate: 72,
      steps: 8500,
      sleepHours: 7.5,
      lastSync: "2024-02-20T10:30:00Z"
    },
    googleFit: {
      isConnected: true,
      connectedAt: "2024-02-19..."
    },
    points: 150,
    savedCO2: 45.2
  }
}
```

### Update Profile (Only Age)
```
PUT /user/update-profile
Body: { "age": 26 }

Success Response:
{
  message: "Profile updated successfully",
  user: { ... full updated user ... }
}

If Google Fit Connected & Try to Update Height/Weight:
{
  message: "Height and weight are auto-synced from Google Fit...",
  googleFitConnected: true
}
```

### Get Health Recommendation
```
GET /user/health-recommendation
Response:
{
  success: true,
  environment: {
    city: "New York",
    lat: 40.7128,
    lon: -74.0060,
    aqi: 2
  },
  user_context: {
    status: "Balanced",
    bmi: 23.15,
    weight: "75 kg",
    height: "180 cm",
    googleFitConnected: true
  },
  recommendation: "Great news! The air in New York is clean. Since your status is Balanced, a 30-minute walk would be excellent for your health."
}
```

---

## Summary of Benefits

✅ **Automatic Data Sync**: Height, weight auto-synced from Google Fit  
✅ **No Manual Entry**: Location auto-detected from IP, no manual entry needed  
✅ **Smart Fallback**: Manual entry only when Google Fit not connected  
✅ **Consistent req.user**: All controllers use latest data from req.user  
✅ **Real-time Updates**: Every API call updates req.user immediately  
✅ **Reduced Manual Work**: Users don't manually enter basic health metrics  

---

## Testing Checklist

- [ ] Test `/health/summary` syncs height & weight
- [ ] Test `/health/body-metrics` auto-saves & updates req.user
- [ ] Test `/health/location` auto-detects if empty
- [ ] Test `/user/update-profile` blocks height/weight when Google Fit connected
- [ ] Test `/user/update-profile` allows height/weight when Google Fit disconnected
- [ ] Test `/user/check-auth` returns complete user data
- [ ] Test `/user/health-recommendation` uses auto-detected location
- [ ] Test location is saved after first `/health/location` call

