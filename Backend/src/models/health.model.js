import mongoose from 'mongoose';

// --- HEALTH ASSESSMENT MODEL ---
const healthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // AI Risk Analysis (Mapped to individual probability cards)
  cardiovascular_risk: {
    probability: { type: Number, default: 0 },
    level: { type: String, default: 'Low' } // e.g., "Low", "Medium", "High"
  },
  respiratory_risk: {
    probability: { type: Number, default: 0 },
    level: { type: String, default: 'Low' }
  },
  heat_vulnerability: {
    probability: { type: Number, default: 0 },
    level: { type: String, default: 'Low' }
  },

  // Activity Tracking
  physical_activity_status: {
    value: { type: Number, default: 0 }, // Percentage toward weekly goal (e.g., 75%)
    label: { type: String, default: 'Target Progress' }
  },

  // Main Dashboard Score (Circular Progress)
  overall_health_score: {
    score: { type: Number, default: 0 },
    level: { type: String, default: 'Awaiting Analysis' }
  },

  createdAt: { type: Date, default: Date.now }
});

// Optimization: Index by user and date for fast dashboard retrieval
healthSchema.index({ user: 1, createdAt: -1 });

export const Health = mongoose.model('Health', healthSchema);