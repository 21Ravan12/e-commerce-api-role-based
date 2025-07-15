const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
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

// Indexes
ratingSchema.index({ article: 1, user: 1 }, { unique: true });
ratingSchema.index({ article: 1, rating: 1 });
ratingSchema.index({ user: 1 });

// Pre-save hook to ensure rating is between 1 and 5
ratingSchema.pre('save', function(next) {
  if (this.rating < 1 || this.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  next();
});

module.exports = ratingSchema;