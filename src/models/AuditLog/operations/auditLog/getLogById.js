/**
 * Gets a single admin log by ID
 * @param {Model} AuditLog - Mongoose AuditLog model
 * @param {string} logId - Log entry ID
 * @returns {Promise<Object|null>} - Log entry or null if not found
 */
async function getLogById(AuditLog, logId) {
  try {
    return await AuditLog.findById(logId)
      .lean();
  } catch (err) {
    console.error(`Error fetching admin log ${logId}:`, err);
    throw err;
  }
}

module.exports = getLogById;