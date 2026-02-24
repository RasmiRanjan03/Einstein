# User Data Management - Quick Guide

## What Changed?

**All user details are now automatically managed and stored in `req.user`**

### 1. **Height & Weight** 🏋️
- ✅ Auto-synced from Google Fit
- ❌ NO manual entry when Google Fit is connected
- ✅ Can manually edit ONLY if Google Fit is disconnected

### 2. **Location** 📍
- ✅ Auto-detected from your IP (runs automatically)
- ❌ NO manual entry required
- ✅ Auto-saved to your profile

### 3. **Health Data** 💪
- ✅ Steps, heart rate, sleep → Auto-synced from Google Fit
- ✅ Age → You can manually update this only
- ✅ All data always available in `req.user`

---

## How It Works

### When You Call Any Health API
```
1. API fetches data from Google Fit
2. Data is saved to database
3. req.user is updated with latest data
4. All endpoints receive fresh data via req.user
```

### For Location
```
1. System checks if location is saved
2. If not → Auto-detects from your IP
3. Auto-saves to your profile
4. Available in all future requests
```

---

## API Endpoints to Use

### Get All Your Data
```
GET /api/users/me
→ Returns: All user info (profile, health stats, location, etc.)
```

### Update Only Age
```
PUT /api/users/update-profile
Body: { "age": 25 }
→ Success! Height & weight come from Google Fit
```

### Get Health Recommendation
```
GET /api/users/health-recommendation
→ Uses your location (auto-detected if needed)
→ Uses your health data from Google Fit
```

### Get All Health Summary
```
GET /api/fitness/summary
→ Auto-syncs height, weight, age from Google Fit
→ Updates req.user with latest data
```

### Get Location (Auto-Detect)
```
GET /api/fitness/location
→ Auto-detects from IP if not saved
→ Returns: City, coordinates, weather
```

---

## What NOT to Do ❌

❌ Don't send height/weight in update-profile when Google Fit is connected  
❌ Don't manually update location - it's automatic  
❌ Don't fetch user from database separately - use req.user  

---

## If You Need to Manually Edit Height/Weight

1. Go to your Google Fit settings
2. Disconnect the app
3. Then call: `PUT /api/users/update-profile` with height and weight
4. Reconnect Google Fit when ready
5. Height/weight will sync automatically again

---

## Quick Test

### 1. Check if Google Fit is Connected
```
GET /api/users/check-auth
Look for: googleFit.isConnected (true/false)
```

### 2. Sync Latest Health Data
```
GET /api/fitness/summary
→ Auto-saves height, weight from Google Fit
→ Updates req.user
```

### 3. Get Your Location
```
GET /api/fitness/location
→ Auto-detects if not set
→ Auto-saves to profile
```

### 4. Update Your Age
```
PUT /api/users/update-profile
Body: { "age": 26 }
→ Success! (No height/weight needed)
```

---

## Data Sync Happens Automatically

Every time you call:
- `/api/fitness/steps` → Updates step count & req.user
- `/api/fitness/heart-rate` → Updates heart rate & req.user
- `/api/fitness/body-metrics` → Updates height/weight & req.user
- `/api/fitness/sleep` → Updates sleep hours & req.user
- `/api/fitness/dashboard/realtime` → Full sync of everything & req.user

So `req.user` is **ALWAYS up-to-date** across all endpoints! 🎯

