const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  article: {
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeBase.Article',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isHelpful: {
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    text: String,
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ article: 1, user: 1 }, { unique: true });
feedbackSchema.index({ article: 1, isHelpful: 1 });
feedbackSchema.index({ user: 1, status: 1 });
feedbackSchema.index({ status: 1, createdAt: -1 });

// Pre-save hook to update article helpful/not helpful counts
feedbackSchema.pre('save', async function(next) {
  if (this.isModified('isHelpful')) {
    const Article = mongoose.model('KnowledgeBase.Article');
    const increment = this.isHelpful ? { helpfulCount: 1 } : { notHelpfulCount: 1 };
    await Article.findByIdAndUpdate(this.article, { $inc: increment });
  }
  next();
});

module.exports = feedbackSchema;