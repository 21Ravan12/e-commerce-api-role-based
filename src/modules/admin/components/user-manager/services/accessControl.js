const User = require('../../../../../models/User');
const logger = require('../../../../../services/logger');

// Permission levels
const PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  MANAGE: 'manage'
};

// Resource types
const RESOURCES = {
  USER: 'user',
  PRODUCT: 'product',
  ORDER: 'order',
  SETTINGS: 'settings'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  customer: {
    user: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
    product: [PERMISSIONS.VIEW],
    order: [PERMISSIONS.VIEW, PERMISSIONS.EDIT]
  },
  seller: {
    user: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
    product: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.MANAGE],
    order: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.MANAGE]
  },
  admin: {
    user: Object.values(PERMISSIONS),
    product: Object.values(PERMISSIONS),
    order: Object.values(PERMISSIONS),
    settings: Object.values(PERMISSIONS)
  }
};

/**
 * Check if user has permission for a resource
 * @param {Object} user - User object
 * @param {String} resource - Resource type
 * @param {String} permission - Permission level
 * @returns {Boolean} True if permission is granted
 */
function checkPermission(user, resource, permission) {
  if (!user || !user.roles || !resource || !permission) {
    return false;
  }

  // Check each role for permissions
  return user.roles.some(role => {
    const rolePerms = ROLE_PERMISSIONS[role] || {};
    return rolePerms[resource] && rolePerms[resource].includes(permission);
  });
}

/**
 * Middleware to validate access
 * @param {String} resource - Resource type
 * @param {String} permission - Required permission
 * @returns {Function} Express middleware
 */
function validateAccess(resource, permission) {
  return async (req, res, next) => {
    try {
      // Get full user data if needed
      const user = await User.findUser(req.user._id);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (checkPermission(user, resource, permission)) {
        return next();
      }

      logger.warn(`Unauthorized access attempt by user ${user._id} to ${resource} with ${permission}`);
      res.status(403).json({ error: 'Forbidden' });
    } catch (error) {
      logger.error(`Access control error: ${error.message}`);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = {
  PERMISSIONS,
  RESOURCES,
  checkPermission,
  validateAccess
};