const mongoose = require('mongoose');

/**
 * Retrieves admin logs with pagination and filtering
 * @param {Model} AuditLog - Mongoose AuditLog model
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
async function getLogsByUserId(AuditLog, options = {}) {
  try {
    const {
      userId,
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
    const adminQuery = {};

    if (performedBy) {
      query.performedBy = performedBy;
      adminQuery.performedBy = performedBy;
    }
    if (userId) {
      query.user = userId;  
      adminQuery.performedBy = userId;
    }
    if (action) query.action = action.toLowerCase();
    if (targetModel) query.targetModel = targetModel;
    if (status) query.status = status.toLowerCase();

    if (startDate || endDate) {
      query.createdAt = {};
      adminQuery.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
        adminQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
        adminQuery.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      query.$text = { $search: search };
      // AdminLog modelde text index varsa aynı şekilde uygulanabilir
      adminQuery.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const AdminLog = mongoose.model('AdminLog');

    const [auditLogs, adminLogs, totalAudit, totalAdmin] = await Promise.all([
      AuditLog.find(query).sort(sortBy).skip(skip).limit(limit).lean(),
      AdminLog.find(adminQuery).sort(sortBy).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
      AdminLog.countDocuments(adminQuery)
    ]);

    const logs = [...auditLogs, ...adminLogs].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = totalAudit + totalAdmin;
    const totalPages = Math.ceil(total / limit);

    return {
      auditLogs, adminLogs, totalAudit, totalAdmin
    };
  } catch (err) {
    console.error('Error fetching admin logs:', err);
    throw err;
  }
}

module.exports = getLogsByUserId;
