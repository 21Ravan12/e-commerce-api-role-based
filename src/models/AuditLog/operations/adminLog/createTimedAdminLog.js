/**
   * Creates and manages a timed log entry (start/finish)
   * @param {Model} AdminLog - Mongoose AdminLog model
   * @param {Object} logData - Initial log data
   * @returns {Promise<{logEntry: Object, complete: Function}>} - Log entry and completion function
*/
async function createTimedAdminLog(AdminLog, createAdminLog, updateAdminLog, logData) {
    const logEntry = await createAdminLog(AdminLog, {
      ...logData,
      status: 'pending'
    });

    /**
     * Completes the timed log entry
     * @param {Object} completionData - Completion data
     * @param {string} completionData.status - Final status
     * @param {Object} completionData.details - Additional details
     * @returns {Promise<Object>} - Updated log entry
     */
    const complete = async (completionData = {}) => {
      if (!logEntry) return null;
      return updateAdminLog(
        AdminLog,
        logEntry._id,
        {
          ...completionData,
          details: {
            ...completionData.details,
            durationMs: new Date() - logEntry.startTime
          }
        }
      );
    };

    return { logEntry, complete };
}

module.exports = createTimedAdminLog;