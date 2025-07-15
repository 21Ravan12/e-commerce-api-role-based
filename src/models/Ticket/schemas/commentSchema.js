const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  ticket: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket reference is required']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ ticket: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ createdAt: -1 });

// Middleware to update updatedAt field
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = commentSchema;