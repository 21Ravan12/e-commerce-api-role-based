const bcrypt = require('bcryptjs');
const logger = require('../../../../services/logger');

async function changePassword(User, {
  userId,
  newPassword,
  ip,
  userAgent
}) {
  // Input validation
  if (!userId || !newPassword) {
    throw new Error('userId and newPassword are required');
  }

  try {
    // Find the user with all necessary fields
    const user = await User.findOne({ _id: userId })
      .select('+password +auth +status +encryptedData +emailHash');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify encryptedData structure
    if (!user.encryptedData) {
      user.encryptedData = {};
    }

    // Account status check
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Password requirements
    if (newPassword.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }

    // Password update logic
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.auth.passwordChangedAt = new Date();
    
    // Track login history
    if (ip) {
      user.auth.loginHistory.push({
        ip: ip === '::1' ? '127.0.0.1' : ip,
        userAgent: userAgent || 'Unknown',
        timestamp: new Date(),
        action: 'password_change'
      });
      
      // Keep only last 20 entries
      if (user.auth.loginHistory.length > 20) {
        user.auth.loginHistory = user.auth.loginHistory.slice(-20);
      }
    }

    await user.save();

    // Log success
    logger.info(`Password changed successfully for user ${userId}`, {
      userId,
      ip,
      changedAt: user.auth.passwordChangedAt
    });

    return {
      success: true,
      changedAt: user.auth.passwordChangedAt,
      userId: user._id
    };

  } catch (error) {
    logger.error(`Password change failed for user ${userId}`, {
      error: error.message,
      userId,
      ip,
      stack: error.stack
    });
    
    throw error; // Re-throw for controller handling
  }
}

module.exports = changePassword;