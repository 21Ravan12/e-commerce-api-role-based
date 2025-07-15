const { Schema } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const auditLogSchema = new Schema({
  // Core Fields
  event: {
    type: String,
    required: [true, 'Event type is required'],
    minlength: [1, 'Event type must be at least 1 character'],
    maxlength: [100, 'Event type cannot exceed 100 characters'],
    trim: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userEmail: {
    type: String,
    index: true,
    trim: true,
    lowercase: true
  },
  ip: {
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
    maxlength: [512, 'User agent cannot exceed 512 characters']
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning', 'info', 'pending'],
    default: 'info',
    index: true
  },
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin', 'system', 'cli'],
    required: [true, 'Source is required'],
    index: true,
    lowercase: true
  },
  action: {
    type: String,
    required: [true, 'Action type is required'],
    index: true,
    lowercase: true
  },
  entityType: {
    type: String,
    maxlength: [50, 'Entity type cannot exceed 50 characters'],
    index: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  correlationId: {
    type: String,
    default: uuidv4
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

// Indexes
auditLogSchema.index({ event: 1, status: 1 });
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ source: 1, action: 1 });
auditLogSchema.index({ correlationId: 1 });
auditLogSchema.index({
  event: 'text',
  userAgent: 'text',
  'metadata.message': 'text'
});

// Virtuals
auditLogSchema.virtual('humanTime').get(function() {
  return this.timestamp.toLocaleString();
});

auditLogSchema.virtual('logMessage').get(function() {
  return `[${this.source.toUpperCase()}] ${this.event}: ${this.status}`;
});

// Pre-save hook
auditLogSchema.pre('save', function(next) {
  if (this.event) this.event = this.event.trim();
  if (this.userAgent) this.userAgent = this.userAgent.substring(0, 512);
  if (this.userEmail) this.userEmail = this.userEmail.toLowerCase().trim();
  if (this.source) this.source = this.source.toLowerCase();
  if (this.action) this.action = this.action.toLowerCase();
  if (typeof this.metadata !== 'object' || this.metadata === null) {
    this.metadata = {};
  }
  if (this.ip === '::1') this.ip = '127.0.0.1';
  next();
});

module.exports = auditLogSchema;