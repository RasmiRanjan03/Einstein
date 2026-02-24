import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ✅ FIXED: Removed 'next' parameter - these are route handlers, not middleware
// controller/auth.controller.js
export const signup = async (req, res) => { // REMOVED 'next'
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email already registered' });
    }

    // This line triggers the 'pre-save' hook in the model
    const newUser = await User.create({ name, email, password });
    
    const token = signToken(newUser._id);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({ 
      status: 'success', 
      token, 
      data: { user: userResponse } 
    });
  } catch (error) {
    // If you see "next is not a function" here, it's because the model crashed
    return res.status(400).json({ 
      status: 'fail', 
      message: error.message 
    });
  }
};

// ✅ FIXED: Removed 'next' parameter - these are route handlers, not middleware
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Please provide email and password' 
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');
    
    // Validate credentials
    if (!user) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Invalid email or password' 
      });
    }

    const passwordMatch = await user.correctPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = signToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({ 
      status: 'success', 
      token, 
      data: { user: userResponse } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ 
      status: 'fail',
      message: error.message || 'Login failed' 
    });
  }
};