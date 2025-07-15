const User = require('../../../../../models/User');
const logger = require('../../../../../services/logger');

// Valid roles in the system
const VALID_ROLES = ['customer', 'seller', 'vendor', 'moderator', 'admin'];

/**
 * Assign roles to a user
 * @param {String} userId - The user ID to update
 * @param {Array} roles - Array of roles to assign
 * @returns {Object} Updated user object
 */
async function assignRoles(userId, roles) {
  try {
    // Validate input
    if (!userId || !roles || !Array.isArray(roles)) {
      throw new Error('Invalid input parameters');
    }

    // Validate each role
    const invalidRoles = roles.filter(role => !VALID_ROLES.includes(role));
    if (invalidRoles.length > 0) {
      throw new Error(`Invalid roles provided: ${invalidRoles.join(', ')}`);
    }

    // Ensure at least one role is assigned
    if (roles.length === 0) {
      throw new Error('User must have at least one role');
    }

    // Update user roles
    const updatedUser = await User.assignRoles(
      userId,
      roles
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    logger.info(`Roles updated for user ${userId}: ${roles.join(', ')}`);

    return updatedUser;
  } catch (error) {
    logger.error(`Role assignment failed: ${error.message}`);
    throw error;
  }
}

/**
 * Validate if a user has required roles
 * @param {Object} user - User object
 * @param {Array} requiredRoles - Array of required roles
 * @returns {Boolean} True if user has all required roles
 */
function hasRequiredRoles(user, requiredRoles) {
  if (!user || !user.roles || !Array.isArray(requiredRoles)) {
    return false;
  }

  return requiredRoles.every(role => user.roles.includes(role));
}

module.exports = {
  assignRoles,
  hasRequiredRoles,
  VALID_ROLES
};