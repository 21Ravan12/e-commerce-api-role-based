const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const adminLogSchema = new Schema({
  // Core action information
  action: {
    type: String,
    required: [true, 'Action type is required'],
    enum: [
      'get_user',
      'list_users',
      'update_user_status',
      'assign_roles',
      'delete_user',
      'add_category',
      'update_category',
      'delete_category',
      'create_campaign',
      'delete_campaign',
      'update_campaign',
      'export_data',
      'user_management',
      'role_change',
      'bulk_delete_articles',
      'bulk_update_articles',
      'export_all_data',
      'purge_old_versions',
      'rebuild_search_index',
      'restore_deleted_article',
      'update_system_settings',
      'get_assigned_tickets',
      'get_closed_tickets',
      'get_escalated_tickets',
      'get_high_priority_tickets',
      'get_open_tickets',
      'get_pending_tickets',
      'get_resolved_tickets',
      'get_user_tickets',
      'get_admin_orders',
      'update_order_status',
      'get_payment',
      'get_payments',
      'find_payment_by_order',
      'get_total_revenue'
    ],
    index: true,
    lowercase: true,
    trim: true
  },
  
  // Target information
  targetModel: {
    type: String,
    required: [true, 'Target model is required'],
    index: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  targetIds: [{
    type: Schema.Types.ObjectId,
    index: true
  }],
  
  // Performer information
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performing user is required'],
    index: true
  },
  performedByEmail: {
    type: String,
    index: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  
  // Context information
  reason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial_success', 'pending'],
    default: 'success',
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Technical information
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    validate: {
      validator: function(v) {
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$|^::1$|^127\.0\.0\.1$/.test(v);
      },
      message: props => `${props.value} is not a valid IP address!`
    }
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
    maxlength: [512, 'User agent cannot exceed 512 characters'],
    trim: true
  },
  source: {
    type: String,
    enum: ['web', 'api', 'cli', 'system'],
    default: 'web',
    index: true
  },
  correlationId: {
    type: String,
    default: uuidv4,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for optimized queries
adminLogSchema.index({ action: 1, targetModel: 1 });
adminLogSchema.index({ performedBy: 1, createdAt: -1 });
adminLogSchema.index({ targetModel: 1, targetId: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({
  reason: 'text',
  'details.message': 'text'
});

// Virtuals
adminLogSchema.virtual('summary').get(function() {
  return `${this.performedByEmail} performed ${this.action} on ${this.targetModel}`;
});

adminLogSchema.virtual('humanTime').get(function() {
  return this.createdAt.toLocaleString();
});

// Pre-save hooks
adminLogSchema.pre('save', function(next) {
  // Normalize fields
  if (this.action) this.action = this.action.toLowerCase().trim();
  if (this.userAgent) this.userAgent = this.userAgent.substring(0, 512).trim();
  if (this.performedByEmail) this.performedByEmail = this.performedByEmail.toLowerCase().trim();
  if (this.reason) this.reason = this.reason.trim();
  if (this.ipAddress === '::1') this.ipAddress = '127.0.0.1';
  
  // Ensure details is always an object
  if (typeof this.details !== 'object' || this.details === null) {
    this.details = {};
  }
  
  next();
});

module.exports = adminLogSchema;