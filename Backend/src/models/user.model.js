import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

// models/user.model.js
userSchema.pre('save', async function() {
  // 1. Only hash if the password was actually changed
  if (!this.isModified('password')) return;

  try {
    // 2. Hash the password
    this.password = await bcrypt.hash(this.password, 12);
    // 3. DO NOT call next() when using an async function in modern Mongoose
  } catch (err) {
    throw new Error('Password encryption failed');
  }
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model('User', userSchema);