const logger = require('../../../../services/logger');

async function updateUser(User,userId, updateData) {
    // Input validation
    if (!userId) {
      throw new Error('userId is required');
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  
    // Fields that should never be updated through this method
    const protectedFields = [
      'password',
      'encryptedData',
      'emailHash',
      'phoneHash',
      'auth.passwordChangedAt',
      'auth.passwordResetToken',
      'auth.passwordResetExpires',
      'auth.mfa.secret',
      'auth.mfa.backupCodes'
    ];
  
    // Remove protected fields from updateData
    protectedFields.forEach(field => {
      const fieldParts = field.split('.');
      let current = updateData;
      
      for (let i = 0; i < fieldParts.length - 1; i++) {
        if (current[fieldParts[i]]) {
          current = current[fieldParts[i]];
        } else {
          current = null;
          break;
        }
      }
      
      if (current && current[fieldParts[fieldParts.length - 1]]) {
        delete current[fieldParts[fieldParts.length - 1]];
      }
    });
  
    // Handle nested updates (like preferences)
    if (updateData.preferences) {
      user.preferences = {
        ...user.preferences,
        ...updateData.preferences
      };
      delete updateData.preferences;
    }
  
    // Handle commerce updates
    if (updateData.commerce) {
      user.commerce = {
        ...user.commerce,
        ...updateData.commerce
      };
      delete updateData.commerce;
    }

    // Handle meta updates
    if (updateData.meta) {
      user.meta = {
        ...user.meta,
        ...updateData.meta
      };
      delete updateData.meta;
    }

    // Handle status updates
    if (updateData.status) {
      user.status = updateData.status;
      delete updateData.status;
    }

    // Handle role updates
    if (updateData.role) {
      console.log('Updating role:', updateData.role);
      user.roles = updateData.role;
      delete updateData.role;
    }

    // Handle auth updates (including MFA)
    if (updateData.auth) {
      // Clone auth updates to avoid modifying the original
      const authUpdates = { ...updateData.auth };
      
      // Clean undefined values from auth updates
      Object.keys(authUpdates).forEach(key => {
        if (authUpdates[key] === undefined) {
          delete authUpdates[key];
        }
      });

      // Handle login history (append, don't overwrite)
      if (authUpdates.loginHistory) {
        user.auth.loginHistory = [
          ...(user.auth.loginHistory || []),
          ...authUpdates.loginHistory
        ];
        delete authUpdates.loginHistory;
      }

      // Ensure auth exists before spreading updates
      user.auth = {
        ...(user.auth || {}), // Ensure auth exists
        ...authUpdates
      };

      delete updateData.auth;
    }
  
    // Update all remaining top-level fields
    for (const [key, value] of Object.entries(updateData)) {
      if (user[key] !== undefined && value !== undefined && !protectedFields.includes(key)) {
        user[key] = value;
      }
    }
  
    try {
      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user: ' + error.message, {
        error: error.stack,
        userId,
        updateData
      });
      throw new Error('Failed to update user information: ' + error.message);
    }
}

module.exports = updateUser;