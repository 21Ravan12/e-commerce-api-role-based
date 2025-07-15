/**
 * Retrieves admin logs with pagination and filtering
 * @param {Model} AdminLog - Mongoose AdminLog model
 * @param {Object} options - Query options
 * @param {ObjectId} [options.performedBy] - Filter by user ID
 * @param {string} [options.action] - Filter by action type
 * @param {string} [options.targetModel] - Filter by target model
 * @param {Date} [options.startDate] - Start date filter
 * @param {Date} [options.endDate] - End date filter
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.search] - Text search query
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Items per page
 * @param {string} [options.sortBy='-createdAt'] - Sort field and direction
 * @returns {Promise<Object>} - Paginated results
 */
async function getAdminLogs(AdminLog, options = {}) {
  try {
    const {
      performedBy,
      action,
      targetModel,
      startDate,
      endDate,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = '-createdAt'
    } = options;

    const query = {};

    if (performedBy) query.performedBy = performedBy;
    if (action) query.action = action.toLowerCase();
    if (targetModel) query.targetModel = targetModel;
    if (status) query.status = status.toLowerCase();
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Ensure page and limit are valid positive integers
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20;

    const skip = (safePage - 1) * safeLimit;

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(safeLimit)
        .populate('performedBy', 'username email role')
        .lean(),
      AdminLog.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
      limit: safeLimit
    };
  } catch (err) {
    console.error('Error fetching admin logs:', err);
    throw err;
  }
}

module.exports = getAdminLogs;