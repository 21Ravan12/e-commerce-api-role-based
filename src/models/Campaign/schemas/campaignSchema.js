const { Schema } = require('mongoose');

const campaignSchema = new Schema({
  campaignName: {
    type: String,
    required: [true, 'Campaign name is required'],
    minlength: [1, 'Campaign name must be at least 1 character'],
    maxlength: [100, 'Campaign name cannot exceed 100 characters'],
    trim: true,
    index: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    index: true
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1'],
    default: null
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft',
    index: true
  },
  campaignType: {
    type: String,
    required: [true, 'Campaign type is required'],
    enum: ['fixed', 'percentage', 'free_shipping', 'bundle', 'buy_x_get_y'],
    index: true
  },
  campaignAmount: {
    type: Number,
    required: [true, 'Campaign amount is required'],
    validate: {
      validator: function(v) {
        if (this.campaignType === 'percentage') {
          return v <= 100 && v > 0;
        }
        return v > 0;
      },
      message: 'Percentage campaigns must be 1-100, fixed amounts must be positive'
    }
  },
  validCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Product.Category'
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  minPurchaseAmount: {
    type: Number,
    min: [0, 'Minimum purchase cannot be negative'],
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: [0, 'Max discount cannot be negative'],
    validate: {
      validator: function(v) {
        return this.campaignType === 'percentage' ? true : !v;
      },
      message: 'Max discount only applies to percentage campaigns'
    }
  },
  customerSegments: {
    type: String,
    enum: ['all', 'new', 'returning', 'vip', 'custom'],
    default: 'all'
  },
  customCustomers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  promotionCodes: [{
    type: Schema.Types.ObjectId,
    ref: 'PromotionCode'
  }],
  landingPageURL: {
    type: String,
    validate: {
      validator: v => /^(http|https):\/\/[^ "]+$/.test(v),
      message: 'Invalid URL format'
    }
  },
  bannerImage: {
    type: String,
    validate: {
      validator: v => /\.(jpg|jpeg|png|webp|svg)$/i.test(v),
      message: 'Image must be JPG, PNG, WEBP, or SVG'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
campaignSchema.index({ startDate: 1, endDate: 1 });
campaignSchema.index({ status: 1, campaignType: 1 });
campaignSchema.index({ validCategories: 1 });

// Middleware
campaignSchema.pre('save', function(next) {
  const now = new Date();
  if (this.endDate < now) {
    this.status = 'completed';
  } else if (this.startDate <= now && this.endDate >= now && this.status === 'draft') {
    this.status = 'active';
  }
  next();
});

// Virtuals
campaignSchema.virtual('remainingUses').get(function() {
  return this.usageLimit ? this.usageLimit - this.usageCount : null;
});

campaignSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
});

module.exports = campaignSchema;