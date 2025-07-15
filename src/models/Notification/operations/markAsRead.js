/**
 * Marks one or multiple notifications as read
 * @param {Model} Notification - Mongoose Notification model
 * @param {string|Array<string>} notificationIds - Single notification ID or array of IDs
 * @param {string} [userId] - Optional user ID to verify ownership
 * @returns {Promise<Object>} Update result
 */
module.exports = async function markAsRead(Notification, notificationIds, userId = null) {
  try {
    // Convert single ID to array for uniform processing
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    // Prepare update query
    const query = { 
      _id: { $in: ids },
      status: 'unread' // Only update if currently unread
    };

    // Add user ownership check if userId is provided
    if (userId) {
      query.recipient = userId;
    }

    // Perform bulk update
    const result = await Notification.updateMany(
      query,
      { 
        $set: { 
          status: 'read',
          readAt: new Date() 
        } 
      }
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};