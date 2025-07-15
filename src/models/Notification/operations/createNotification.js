/**
 * Creates a new notification
 * @param {Model} Notification - Mongoose Notification model
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.recipient - ID of the recipient user
 * @param {string} [notificationData.sender] - ID of the sender user (optional)
 * @param {string} notificationData.type - Notification type
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification content
 * @param {Object} [notificationData.payload] - Additional data payload
 * @param {string} [notificationData.actionUrl] - URL for action
 * @param {string} [notificationData.icon] - Icon/image URL
 * @param {string} [notificationData.priority] - Priority level (low/medium/high/critical)
 * @returns {Promise<Object>} Created notification
 */
module.exports = async function createNotification(Notification, notificationData) {
  try {
    // Validate required fields
    if (!notificationData.recipient || !notificationData.type || 
        !notificationData.title || !notificationData.message) {
      throw new Error('Missing required notification fields');
    }

    // Create the notification
    const notification = new Notification({
      recipient: notificationData.recipient,
      sender: notificationData.sender,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      payload: notificationData.payload,
      actionUrl: notificationData.actionUrl,
      icon: notificationData.icon,
      priority: notificationData.priority || 'medium',
      status: 'unread'
    });

    // Save to database
    await notification.save();

    // Return lean document for better performance
    return notification.toObject();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};