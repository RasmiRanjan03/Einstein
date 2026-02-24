import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  profile: {
    age: { type: Number, min: 1, max: 120 },
    height: { type: Number, min: 50, max: 300 }, // in cm
    weight: { type: Number, min: 10, max: 500 }, // in kg
    bmi: { type: Number },
    status: { type: String, default: "Unknown" },
    location: {
      lat: { type: Number, default: 0 },
      lon: { type: Number, default: 0 }
    }
  },

  healthStats: {
    heartRate: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    bloodPressure: {
      systolic: { type: Number, default: 0 }, // Upper number
      diastolic: { type: Number, default: 0 }  // Lower number
    },
    lastSync: { type: Date }
  },

  googleFit: {
    accessToken: { type: String },
    refreshToken: { type: String },
    isConnected: { type: Boolean, default: false },
    connectedAt: { type: Date }
  },

  // Eco-Health Gamification
  points: { type: Number, default: 0 }, 
  savedCO2: { type: Number, default: 0 } 
}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

/**
 * PRE-SAVE HOOK
 * Automatically calculates BMI and Status whenever weight/height is modified.
 */
userSchema.pre('save', function(next) {
  if (this.isModified('profile.weight') || this.isModified('profile.height')) {
    if (this.profile.weight > 0 && this.profile.height > 0) {
      const heightInMeters = this.profile.height / 100;
      const calculatedBmi = this.profile.weight / (heightInMeters * heightInMeters);
      this.profile.bmi = parseFloat(calculatedBmi.toFixed(2));

      // BMI Status Logic
      if (this.profile.bmi < 18.5) this.profile.status = "Underweight";
      else if (this.profile.bmi < 25) this.profile.status = "Balanced";
      else if (this.profile.bmi < 30) this.profile.status = "Overweight";
      else this.profile.status = "Obese";
    }
  }
  next();
});

export default mongoose.model('User', userSchema);