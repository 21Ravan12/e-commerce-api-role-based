// authorization.js

/**
 * Authorization middleware for Express
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists and has roles (adjust this based on your user object structure)
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: 'Forbidden - No user roles found' });
    }

    // Check if user has any of the allowed roles
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Forbidden - Requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    // User is authorized, proceed to the next middleware/route handler
    next();
  };
};

module.exports = { authorize };