# Blood Pressure Integration - Complete Guide ✅

## What's Been Added

Blood pressure tracking has been integrated into your health monitoring system. The system now:
- ✅ Fetches blood pressure data from Google Fit (if available)
- ✅ Stores blood pressure readings in the database
- ✅ Calculates blood pressure status (Normal, Elevated, High, Crisis)
- ✅ Returns blood pressure in all health summary endpoints
- ✅ Gracefully handles cases where blood pressure data isn't available

---

## Database Changes

### User Model (`models/User.js`)
Added blood pressure to `healthStats`:
```javascript
healthStats: {
    heartRate: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    bloodPressure: {
        systolic: { type: Number, default: 0 },  // Upper number (mmHg)
        diastolic: { type: Number, default: 0 }  // Lower number (mmHg)
    },
    lastSync: { type: Date }
}
```

---

## New Endpoint

### Get Blood Pressure Data
```
GET /api/fitness/blood-pressure
```

**Response (Success - Data Available)**:
```json
{
  "success": true,
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80,
    "reading": "120/80 mmHg",
    "status": "Normal",
    "readingDate": "2026-02-20T15:45:19.575Z",
    "unit": "mmHg"
  },
  "available": true,
  "timeline": [
    {
      "date": "2026-02-19T00:00:00.000Z",
      "systolic": 118,
      "diastolic": 78
    }
  ],
  "timestamp": "2026-02-20T15:45:19.646Z"
}
```

**Response (No Data Available)**:
```json
{
  "success": true,
  "bloodPressure": {
    "systolic": 0,
    "diastolic": 0,
    "reading": "Not available",
    "status": "No data",
    "message": "Blood pressure data not available. Please enable blood pressure tracking in your Google Fit app or manually track it.",
    "unit": "mmHg"
  },
  "available": false,
  "timestamp": "2026-02-20T15:45:19.646Z"
}
```

---

## Updated Endpoints

### 1. Get Fitness Summary
```
GET /api/fitness/summary
```

Now includes blood pressure in response:
```json
{
  "activity_today": {
    "steps": 8500,
    "calories": 1701.48,
    "distance": 6.26,
    "currentHeartRate": 72,
    "bloodPressure": "120/80"  // ← NEW
  }
}
```

### 2. Get Real-time Dashboard
```
GET /api/fitness/dashboard/realtime
```

Now includes blood pressure in vitals:
```json
{
  "vitals": {
    "weight": 75.5,
    "height": 180,
    "bmi": 23.35,
    "currentHeartRate": 72,
    "bloodPressure": {           // ← NEW
      "systolic": 120,
      "diastolic": 80,
      "reading": "120/80 mmHg"
    }
  }
}
```

### 3. Check Auth
```
GET /api/users/check-auth
```

User object now includes blood pressure in `healthStats`:
```json
{
  "user": {
    "healthStats": {
      "heartRate": 72,
      "steps": 8500,
      "sleepHours": 7.5,
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80
      }
    }
  }
}
```

---

## Blood Pressure Status Scale

| Reading | Status | Category |
|---------|--------|----------|
| < 120/80 | Normal | ✅ Healthy |
| 120-129 / < 80 | Elevated | ⚠️ Monitor |
| 130-139 / 80-89 | High - Stage 1 | ⚠️ See Doctor |
| ≥ 140 / ≥ 90 | High - Stage 2 | 🔴 Medical Attention |
| ≥ 180 / ≥ 120 | Crisis | 🆘 Emergency |

---

## How It Works

### 1. **Automatic Sync**
When you call any health endpoint, the system:
- Tries to fetch blood pressure from Google Fit
- If available → Saves to database
- If not available → Returns "Not available" message (doesn't crash)
- Updates `req.user` with latest data

### 2. **Error Handling**
Blood pressure fetching is now **optional and non-blocking**:
```javascript
try {
    // Fetch blood pressure
    const bpResponse = await fitness.users.dataset.aggregate({
        aggregateBy: [{ dataTypeName: 'com.google.blood_pressure' }],
        ...
    });
} catch (e) {
    console.log('Blood pressure data not available:', e.message);
    // Don't fail the request - continue without BP data
}
```

### 3. **Graceful Degradation**
- If blood pressure data exists → Show it
- If blood pressure data doesn't exist → Show default 0 values + "Not available" message
- Never crash or fail the entire request

---

## Enable Blood Pressure in Google Fit

If you see "Not available" message, here's how to enable it:

1. **Open Google Fit app** on your phone
2. **Go to Profile > Settings**
3. **Enable "Blood Pressure"** tracking
4. **Manually enter readings** or use a compatible smart device
5. **Wait 5-10 minutes** for data to sync
6. **Call the API again** to fetch your data

### Compatible Devices:
- Withings smartwatch
- Omron blood pressure monitors
- Apple Health integration
- Manual entry in Google Fit

---

## Testing the Feature

### Test 1: Get Blood Pressure Data
```bash
curl -X GET http://localhost:5000/api/fitness/blood-pressure \
  -H "Cookie: token=YOUR_TOKEN"
```

### Test 2: Get Dashboard (includes BP)
```bash
curl -X GET http://localhost:5000/api/fitness/dashboard/realtime \
  -H "Cookie: token=YOUR_TOKEN"
```

### Test 3: Get Summary (includes BP)
```bash
curl -X GET http://localhost:5000/api/fitness/summary \
  -H "Cookie: token=YOUR_TOKEN"
```

### Test 4: Check Auth (show BP in user data)
```bash
curl -X GET http://localhost:5000/api/users/check-auth \
  -H "Cookie: token=YOUR_TOKEN"
```

---

## API Changes Summary

| Function | Change |
|----------|--------|
| `getBloodPressure()` | ✅ NEW - Dedicated BP endpoint |
| `getFitnessSummary()` | ✅ UPDATED - Now includes BP (optional) |
| `getRealtimeDashboard()` | ✅ UPDATED - Now includes BP in vitals (optional) |
| `getBodyMetrics()` | ✅ EXISTING - Not changed |
| `getStepsData()` | ✅ EXISTING - Not changed |
| `getHeartRateData()` | ✅ EXISTING - Not changed |
| `getSleepData()` | ✅ EXISTING - Not changed |

---

## Files Modified

1. **`models/User.js`**
   - Added `bloodPressure` to `healthStats`

2. **`controllers/googlefit.controller.js`**
   - ✅ Added `getBloodPressure()` function
   - ✅ Updated `getFitnessSummary()` - Blood pressure fetch wrapped in try-catch
   - ✅ Updated `getRealtimeDashboard()` - Blood pressure fetch wrapped in try-catch

3. **`routes/googlefit.routes.js`**
   - ✅ Added import for `getBloodPressure`
   - ✅ Added route: `GET /blood-pressure`

---

## Important Notes

⚠️ **Blood Pressure is Optional**:
- The system won't crash if blood pressure data isn't available
- Returns `"available": false` if no data is found
- Always returns success (200) even if no BP data exists
- Provides helpful message: "Please enable blood pressure tracking..."

✅ **Graceful Error Handling**:
- Try-catch blocks prevent API failures
- Each health endpoint works independently
- Missing BP data won't affect other health data

🔒 **Data Privacy**:
- Blood pressure is stored securely in MongoDB
- Hidden from password field but visible in profile
- Respects Google Fit privacy settings

---

## Response Examples

### When Blood Pressure Data IS Available:
```json
{
  "success": true,
  "bloodPressure": {
    "systolic": 125,
    "diastolic": 85,
    "reading": "125/85 mmHg",
    "status": "Elevated",
    "available": true
  }
}
```

### When Blood Pressure Data IS NOT Available:
```json
{
  "success": true,
  "bloodPressure": {
    "systolic": 0,
    "diastolic": 0,
    "reading": "Not available",
    "status": "No data",
    "message": "Blood pressure data not available...",
    "available": false
  }
}
```

---

## Troubleshooting

### Getting "Not available" message?
1. ✅ Check Google Fit app - is BP tracking enabled?
2. ✅ Have you entered BP readings?
3. ✅ Wait 5-10 minutes for Google Fit to sync data
4. ✅ Try calling the API again

### Getting error when calling /blood-pressure?
- Blood pressure data type might not be supported by Google Fit for this user
- The system will return a graceful "not available" message instead of an error
- No action needed - this is expected behavior

### BP shows 0/0 in all endpoints?
- This is normal if you haven't set up BP tracking in Google Fit
- Follow the "Enable Blood Pressure in Google Fit" section above
- Once enabled, API will fetch your readings automatically

---

## Summary

✅ Blood pressure integration is **complete and working**  
✅ All endpoints handle missing BP data **gracefully**  
✅ No crashes even if BP data isn't available  
✅ Database schema **updated** with BP fields  
✅ Error handling **implemented** with try-catch blocks  

**Status**: Ready for production! 🚀

