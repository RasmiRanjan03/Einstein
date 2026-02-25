import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  profile: {
    age: { type: Number, min: 1, max: 120, default: 22 },
    height: { type: Number, min: 50, max: 300, default: 175 }, // match vitals.height
    weight: { type: Number, min: 10, max: 500, default: 67 },  // match vitals.weight
    bmi: { type: Number, default: 21.88 },
    status: { type: String, default: "Balanced" }, // Logic based on 21.88 BMI
    location: {
      lat: { type: Number, default: 20.133074 },
      lon: { type: Number, default: 85.619011 },
      city: { type: String, default: "Khurda" },
      country: { type: String, default: "IN" },
      address: { type: String, default: "Khurda, IN" }
    }
  },

  healthStats: {
    heartRate: { type: Number, default: 0 },
    steps: { type: Number, default: 3294 }, // match today.steps
    calories: { type: Number, default: 716.28 }, // match today.calories
    distance: { type: Number, default: 2.02 }, // stored in km to match JSON
    heartMinutes: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    bloodPressure: {
      systolic: { type: Number, default: 120 },
      diastolic: { type: Number, default: 120 }
    },
    lastSync: { type: Date, default: () => new Date("2026-02-25T07:21:55.370Z") }
  },

  environment: {
    temperature: { type: Number, default: 33.12 },
    humidity: { type: Number, default: 32 },
    windSpeed: { type: Number, default: 2.13 },
    pressure: { type: Number, default: 1011 },
    visibility: { type: Number, default: 10000 },
    condition: { type: String, default: "Clear" },
    description: { type: String, default: "clear sky" },
    aqi: { type: Number, default: 4 },
    aqiDescription: { type: String, default: "Poor" },
    lastWeatherUpdate: { type: Date, default: () => new Date("2026-02-25T07:21:55.370Z") }
  },

  googleFit: {
    accessToken: { type: String },
    refreshToken: { type: String },
    isConnected: { type: Boolean, default: false },
    connectedAt: { type: Date }
  },

  points: { type: Number, default: 0 }, 
  savedCO2: { type: Number, default: 0.5 } // Set based on 2.02 km distance
}, { 
  timestamps: true 
});

/**
 * PRE-SAVE HOOK
 * Keeps the "Default" logic active for future updates
 */
userSchema.pre('save', function(next) {
  if (this.isModified('profile.weight') || this.isModified('profile.height')) {
    if (this.profile.weight > 0 && this.profile.height > 0) {
      const heightInMeters = this.profile.height / 100;
      const calculatedBmi = this.profile.weight / (heightInMeters * heightInMeters);
      this.profile.bmi = parseFloat(calculatedBmi.toFixed(2));

      if (this.profile.bmi < 18.5) this.profile.status = "Underweight";
      else if (this.profile.bmi < 25) this.profile.status = "Balanced";
      else if (this.profile.bmi < 30) this.profile.status = "Overweight";
      else this.profile.status = "Obese";
    }
  }
  next();
});

export default mongoose.model('User', userSchema);