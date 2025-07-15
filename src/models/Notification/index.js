const mongoose = require('mongoose');
const notificationSchema = require('./schemas/notificationSchema');

// Register model if not already registered
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Notification Operations
const createNotification = require('./operations/createNotification');
const markAsRead = require('./operations/markAsRead');
const getUserNotifications = require('./operations/getUserNotifications');

// Export initialized model and operations
module.exports = {
  Notification,
  createNotification: createNotification.bind(null, Notification),
  markAsRead: markAsRead.bind(null, Notification),
  getUserNotifications: getUserNotifications.bind(null, Notification),
  
  // Constants for notification types (optional but recommended)
  NOTIFICATION_TYPES: {
    SYSTEM: 'system',
    MESSAGE: 'message',
    ORDER: 'order',
    PROMOTION: 'promotion',
    REVIEW: 'review',
    FOLLOW: 'follow',
    LIKE: 'like',
    COMMENT: 'comment',
    MENTION: 'mention',
    SUPPORT: 'support'
  },
  
  NOTIFICATION_STATUS: {
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived'
  },
  
  PRIORITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }
};