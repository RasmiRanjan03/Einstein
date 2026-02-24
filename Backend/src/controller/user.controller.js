import User from '../models/user.model.js';

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
