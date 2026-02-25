import mongoose from 'mongoose';

// --- CARBON FOOTPRINT MODEL ---
const carbonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Main Score (Circular Progress on Dashboard)
  total_carbon_score: {
    value: { type: Number, default: 0 }, 
    unit: { type: String, default: 'tons CO2/yr' },
    status: { type: String, default: 'Awaiting Analysis' } // e.g., "Below Average", "High"
  },

  // Categorical Breakdown (Mapped to the 4 UI cards)
  breakdown: {
    transport: {
      value: { type: Number, default: 0 },     // e.g., 0.8 tons
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

// Index for fast retrieval of the latest user data
carbonSchema.index({ user: 1, createdAt: -1 });

// Ensure you export it alongside Health
export const Carbon = mongoose.model('Carbon', carbonSchema);