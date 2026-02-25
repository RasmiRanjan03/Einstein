import User from '../models/User.js';

// Save dashboard data to user database
export const saveDashboardData = async (userId, dashboardResponse) => {
  try {
    const updateData = {
      'dashboardData.success': dashboardResponse.success || false,
      'dashboardData.today': dashboardResponse.today || {},
      'dashboardData.vitals': dashboardResponse.vitals || {},
      'dashboardData.location': dashboardResponse.location || {},
      'dashboardData.lastSync': dashboardResponse.lastSync || new Date(),
      'dashboardData.syncStatus': dashboardResponse.syncStatus || 'completed'
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error('Error saving dashboard data:', error);
    throw error;
  }
};

// Get stored dashboard data
export const getStoredDashboardData = async (userId) => {
  try {
    const user = await User.findById(userId).select('dashboardData');
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      dashboard: user.dashboardData || {
        success: false,
        today: {},
        vitals: {},
        location: {},
        lastSync: null,
        syncStatus: 'no-data'
      }
    };
  } catch (error) {
    console.error('Error getting stored dashboard data:', error);
    throw error;
  }
};

// Controller endpoint for stored dashboard data
export const getStoredDashboard = async (req, res) => {
  try {
    const { userId } = req.query;
    let user = req.user;
    
    if (userId && !user) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const dashboardData = await getStoredDashboardData(user._id);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
