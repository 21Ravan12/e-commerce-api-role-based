const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeBase.Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  icon: String,
  metaTitle: String,
  metaDescription: String,
  articleCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ displayOrder: 1 });

// Virtual for child categories
categorySchema.virtual('children', {
  ref: 'KnowledgeBase.Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for articles in this category
categorySchema.virtual('articles', {
  ref: 'KnowledgeBase.Article',
  localField: '_id',
  foreignField: 'category'
});

// Pre-save hook to ensure a category can't be its own parent
categorySchema.pre('save', function(next) {
  if (this.parent && this.parent.equals(this._id)) {
    throw new Error('Category cannot be its own parent');
  }
  next();
});

module.exports = categorySchema;