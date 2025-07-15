const mongoose = require('mongoose');
const { Schema } = mongoose;

const updateArticleSchema = new Schema({
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    type: Map,
    of: new Schema({
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed
    })
  },
  version: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
updateArticleSchema.index({ article: 1, version: 1 });
updateArticleSchema.index({ updatedBy: 1 });
updateArticleSchema.index({ createdAt: -1 });

module.exports = updateArticleSchema;