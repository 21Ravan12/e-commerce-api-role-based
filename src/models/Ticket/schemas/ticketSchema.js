const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'sales', 'general', 'support'],
    required: [true, 'Ticket category is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ticket creator is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.dueDate || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalationReason: {
    type: String,
    trim: true
  },
  resolution: {
    type: String,
    trim: true
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment count
ticketSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'ticket',
  count: true
});

// Virtual for attachment count
ticketSchema.virtual('attachmentCount', {
  ref: 'Attachment',
  localField: '_id',
  foreignField: 'ticket',
  count: true
});

// Indexes for better query performance
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ isEscalated: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ dueDate: 1 });
ticketSchema.index({ title: 'text', description: 'text' });

// Middleware to update updatedAt field
ticketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = ticketSchema;