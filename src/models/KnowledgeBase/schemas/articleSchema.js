const mongoose = require('mongoose');
const { Schema } = mongoose;

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeBase.Category',
    required: true
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeBase.Category'
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  attachments: [{
    url: String,
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    description: String
  }],
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  publishedAt: Date,
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    title: String,
    slug: String, 
    excerpt: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: 'KnowledgeBase.Category'
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'KnowledgeBase.Category'
    },
    tags: [String],
    content: String,
    updatedAt: Date,
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ isFeatured: 1, status: 1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ helpfulCount: -1 });

// Virtual for average rating (will be populated from Rating model)
articleSchema.virtual('averageRating').get(function() {
  return 0; // This will be populated in the controller
});

// Virtual for feedback count
articleSchema.virtual('feedbackCount', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'article',
  count: true
});

module.exports = articleSchema;