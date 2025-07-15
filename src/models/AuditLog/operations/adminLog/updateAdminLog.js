const mongoose = require('mongoose');

/**
 * Updates an existing admin log entry with enhanced functionality
 * @param {Model} AdminLog - Mongoose AdminLog model
 * @param {ObjectId} logId - ID of the log entry to update
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.status] - New status (success, failed, partial_success, pending, cancelled)
 * @param {Object} [updateData.details] - Additional details to merge
 * @param {boolean} [mergeDetails=true] - Whether to merge or replace details
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.includeDuration=true] - Whether to calculate and include duration
 * @param {boolean} [options.preserveOriginal=false] - Keep original values when merging details
 * @param {string} [options.additionalContext] - Additional context for the update
 * @returns {Promise<Object|null>} - Updated log entry or null on failure
 */
async function updateAdminLog(
  AdminLog, 
  logId, 
  updateData, 
  mergeDetails = true, 
  options = {}
) {
  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new Error('Invalid log ID');
    }

    const { 
      includeDuration = true, 
      preserveOriginal = false,
      additionalContext 
    } = options;

    // Get the existing log entry
    const existingLog = await AdminLog.findById(logId);
    if (!existingLog) {
      throw new Error('Log entry not found');
    }

    // Prepare update object
    const now = new Date();
    const update = {
      updatedAt: now,
      ...(includeDuration && { durationMs: now - existingLog.createdAt })
    };

    // Handle status update with validation
    if (updateData.status) {
      const validStatuses = [
        'success', 
        'failed', 
        'partial_success', 
        'pending',
        'cancelled'
      ];
      
      const normalizedStatus = updateData.status.toLowerCase();
      update.status = validStatuses.includes(normalizedStatus)
        ? normalizedStatus
        : existingLog.status; // Fallback to existing status if invalid
    }

    // Handle details update
    if (updateData.details) {
      const detailsUpdate = mergeDetails 
        ? { 
            ...(preserveOriginal ? existingLog.details.toObject() : {}),
            ...updateData.details 
          }
        : updateData.details;

      update.details = detailsUpdate;

      // Include additional context if provided
      if (additionalContext) {
        update.details.additionalContext = additionalContext;
      }
    }

    // Add metadata about the update
    update.metadata = {
      lastUpdatedBy: options.updatedBy || 'system',
      ...(existingLog.metadata || {})
    };

    const updatedLog = await AdminLog.findByIdAndUpdate(
      logId,
      { $set: update },
      { 
        new: true,
        runValidators: true 
      }
    ).lean();

    return updatedLog;
  } catch (err) {
    console.error(`AdminLog update error for ${logId}:`, {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      updateData,
      options
    });
    return null;
  }
}

module.exports = updateAdminLog;