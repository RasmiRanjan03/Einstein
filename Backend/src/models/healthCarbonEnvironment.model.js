import mongoose from 'mongoose';

// --- HEALTH ASSESSMENT MODEL ---
const healthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  

  // UI Display Data (Mapped to the 4 cards in your screenshot)
  cardiovascular_risk: {
    probability: { type: Number, default: 0 },
    level: String
  },
  respiratory_risk: {
    probability: { type: Number, default: 0 },
    level: String
  },
  heat_vulnerability: {
    probability: { type: Number, default: 0 },
    level: String
  },
  physical_activity_status: {
    value: { type: Number, default: 0 }, // Percentage toward goal
    label: String
  },

  // Main Dashboard Score (Circular Progress)
  overall_health_score: {
    score: { type: Number, default: 0 },
    level: { type: String, default: 'Awaiting Analysis' }
  },

  createdAt: { type: Date, default: Date.now }
});

// --- CARBON FOOTPRINT MODEL ---
const carbonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Main Score (Circular Progress)
  total_carbon_score: {
    value: { type: Number, default: 0 }, 
    unit: { type: String, default: 'tons CO2/yr' },
    status: { type: String, default: 'Below Average' }
  },

  // Categorical Breakdown (Mapped to the 4 cards in your screenshot)
  breakdown: {
    transport: {
      value: { type: Number, default: 0 }, // e.g., 0.8
      percentage: { type: Number, default: 0 } // e.g., 33%
    },
    energy: {
      value: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    food: {
      value: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    waste: {
      value: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  },

  createdAt: { type: Date, default: Date.now }
});

// Optimization: Index by user and date for fast dashboard retrieval
healthSchema.index({ user: 1, createdAt: -1 });
carbonSchema.index({ user: 1, createdAt: -1 });

export const Health = mongoose.model('Health', healthSchema);
export const Carbon = mongoose.model('Carbon', carbonSchema);