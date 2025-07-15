const { v4: uuidv4 } = require('uuid');

/**
 * Creates an admin log entry
 * @param {Model} AdminLog - Mongoose AdminLog model
 * @param {Object} logData - Log data
 * @param {string} logData.action - Admin action type
 * @param {string} logData.targetModel - Target model name
 * @param {ObjectId} [logData.targetId] - Single target ID
 * @param {ObjectId[]} [logData.targetIds] - Multiple target IDs
 * @param {ObjectId} logData.performedBy - User ID who performed the action
 * @param {string} [logData.performedByEmail] - User email
 * @param {string} [logData.reason] - Reason for the action
 * @param {string} [logData.status] - Action status
 * @param {Object} [logData.details] - Additional details
 * @param {string} logData.ipAddress - IP address
 * @param {string} logData.userAgent - User agent string
 * @param {string} [logData.source] - Source of the action
 * @returns {Promise<Object|null>} - Created log entry or null on failure
 */
async function createAdminLog(AdminLog, logData) {
  try {
    const logEntry = new AdminLog({
      action: logData.action.toLowerCase(),
      targetModel: logData.targetModel,
      targetId: logData.targetId,
      targetIds: logData.targetIds || [],
      performedBy: logData.performedBy,
      performedByEmail: logData.performedByEmail?.toLowerCase(),
      reason: logData.reason?.substring(0, 500),
      status: ['success', 'failed', 'partial_success', 'pending'].includes(logData.status?.toLowerCase())
        ? logData.status.toLowerCase()
        : 'success',
      details: typeof logData.details === 'object' ? logData.details : {},
      ipAddress: logData.ipAddress === '::1' ? '127.0.0.1' : logData.ipAddress,
      userAgent: logData.userAgent?.substring(0, 512),
      source: ['web', 'api', 'cli', 'system'].includes(logData.source?.toLowerCase())
        ? logData.source.toLowerCase()
        : 'web',
      correlationId: logData.correlationId || uuidv4()
    });

    await logEntry.save();
    return logEntry;
  } catch (err) {
    console.error('AdminLog creation error:', err);
    // Fallback logging
    console.error('ADMIN_LOG_FALLBACK:', {
      timestamp: new Date(),
      ...logData,
      error: err.message
    });
    return null;
  }
}

module.exports = createAdminLog;