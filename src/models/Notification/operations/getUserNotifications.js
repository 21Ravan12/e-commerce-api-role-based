/**
 * Retrieves notifications for a specific user with pagination
 * @param {Model} Notification - Mongoose Notification model
 * @param {string} userId - ID of the user
 * @param {Object} [options] - Query options
 * @param {string} [options.status] - Filter by status (unread/read/archived)
 * @param {string} [options.type] - Filter by notification type
 * @param {number} [options.limit=20] - Number of results per page
 * @param {number} [options.page=1] - Page number
 * @param {string} [options.sort=-createdAt] - Sort field and direction
 * @returns {Promise<Object>} Paginated notifications
 */
module.exports = async function getUserNotifications(Notification, userId, options = {}) {
  try {
    // Validate userId
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Set default options
    const limit = parseInt(options.limit) || 20;
    const page = parseInt(options.page) || 1;
    const skip = (page - 1) * limit;
    const sort = options.sort || '-createdAt';

    // Build query
    const query = { recipient: userId };

    // Add status filter if provided
    if (options.status) {
      query.status = options.status;
    }

    // Add type filter if provided
    if (options.type) {
      query.type = options.type;
    }

    // Execute queries in parallel
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean for better performance
      Notification.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      notifications,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNext,
        hasPrev
      }
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};