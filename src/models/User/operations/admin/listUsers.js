const logger = require('../../../../services/logger');

async function listUsers(User, { page = 1, limit = 10, status, ...otherFilters }) {
  try {
    const defaultSelect = {
      roles: 1,
      status: 1,
      _id: 1,
      username: 1,
      auth: 1
    };

    const finalSelect = Object.assign({}, defaultSelect);
    // Build the actual query filter
    const query = {};
    
    if (status) query.status = status;
    // Add other potential filters
    if (otherFilters.roles) query.roles = otherFilters.roles;
    if (otherFilters.username) query.username = otherFilters.username;
    // Add any other filters you need

    console.log('Final query filter:', query); // Debug log

    const users = await User.find(query)
        .skip((page - 1) * limit)
        .select(finalSelect)
        .limit(limit)
        .lean()
        .exec();

    const total = await User.countDocuments(query).exec();

    console.log(`Found ${users.length} users matching query`); // Debug log
    
    return {
      users,
      total
    };
  } catch (error) {
    logger.error('Database query error:', {
      error: error.message,
      stack: error.stack,
      queryParams: { page, limit, status, ...otherFilters } // Log the input parameters instead
    });
    throw error;
  }
}

module.exports = listUsers;