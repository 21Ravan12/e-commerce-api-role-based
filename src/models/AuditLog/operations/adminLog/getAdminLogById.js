/**
 * Gets a single admin log by ID
 * @param {Model} AdminLog - Mongoose AdminLog model
 * @param {string} logId - Log entry ID
 * @returns {Promise<Object|null>} - Log entry or null if not found
 */
async function getAdminLogById(AdminLog, logId) {
  try {
    console.log(1);
    return await AdminLog.findById(logId)
      .populate('performedBy', 'username email role')
      .lean();
  } catch (err) {
    console.error(`Error fetching admin log ${logId}:`, err);
    throw err;
  }
}

module.exports = getAdminLogById;