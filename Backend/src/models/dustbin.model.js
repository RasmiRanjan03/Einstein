import mongoose from 'mongoose';

const dustbinSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  reportedBy: { type: String, default: "Anonymous" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dustbin', dustbinSchema);