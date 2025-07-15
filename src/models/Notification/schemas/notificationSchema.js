const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  // Recipient of the notification
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Sender of the notification (optional)
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notification type (e.g., 'message', 'order', 'system')
  type: {
    type: String,
    required: true,
    enum: [
      'system', 
      'message', 
      'order', 
      'promotion', 
      'review', 
      'follow', 
      'like', 
      'comment', 
      'mention', 
      'support'
    ],
    index: true
  },
  
  // Notification title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  
  // Notification message/content
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Additional data payload (can be used for deep linking)
  payload: {
    type: Schema.Types.Mixed
  },
  
  // Status of the notification
  status: {
    type: String,
    required: true,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // URL for action (optional)
  actionUrl: {
    type: String,
    trim: true
  },
  
  // Icon or image for the notification (optional)
  icon: {
    type: String,
    trim: true
  },
  
  // Expiration date (optional)
  expiresAt: {
    type: Date
  },
  
  // Read date (optional)
  readAt: {
    type: Date
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });

// Virtual for checking if notification is unread
notificationSchema.virtual('isUnread').get(function() {
  return this.status === 'unread';
});

// Pre-save hook for setting readAt timestamp
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method for creating a system notification
notificationSchema.statics.createSystemNotification = async function(recipientId, title, message, options = {}) {
  return this.create({
    recipient: recipientId,
    type: 'system',
    title,
    message,
    status: 'unread',
    priority: options.priority || 'medium',
    payload: options.payload,
    actionUrl: options.actionUrl,
    icon: options.icon,
    expiresAt: options.expiresAt
  });
};

// Static method for bulk creating notifications
notificationSchema.statics.bulkCreate = async function(notifications) {
  return this.insertMany(notifications);
};

module.exports = notificationSchema;