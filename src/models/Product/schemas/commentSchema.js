const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  commentText: {
    type: String,
    required: true,
    minlength: [3, 'Comment must be at least 3 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

commentSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = commentSchema;