import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// ✅ Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      status: 'success', 
      data: { user } 
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ 
      status: 'fail',
      message: error.message 
    });
  }
};

// ✅ Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Please provide name or email to update' 
      });
    }

    // Check if email is already in use by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ 
          status: 'fail',
          message: 'Email already in use' 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      status: 'success', 
      data: { user } 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(400).json({ 
      status: 'fail',
      message: error.message 
    });
  }
};

// ✅ Delete User Account
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    res.status(500).json({ 
      status: 'fail',
      message: error.message 
    });
  }
};
export const checkauth = async (req, res) => {
  try{
    let token= req.cookies.token
    
        // Check if token exists
        if (!token) {
          return res.status(401).json({ 
            status: 'fail', 
            message: 'You are not logged in. Please log in to access this resource.' 
          });
        }
        console.log('🔐 Token found:', token);
    
        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // 3️⃣ Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return res.status(401).json({
            status: 'fail',
            message: 'The user belonging to this token no longer exists.'
          });
        }
        else{
          return res.status(200).json({
            status: 'success',
            message: 'User is authenticated',
            data: { user: currentUser }
          });
        }
  }catch (error) {
    console.log(error)
  }
}
