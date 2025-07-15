const mongoose = require('mongoose');
const { Schema } = mongoose;

const attachmentSchema = new Schema({
  ticket: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket reference is required']
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
attachmentSchema.index({ ticket: 1 });
attachmentSchema.index({ uploadedBy: 1 });
attachmentSchema.index({ uploadedAt: -1 });
attachmentSchema.index({ mimeType: 1 });

module.exports = attachmentSchema;