const { Schema } = require('mongoose');

const promotionCodeSchema = new Schema({
  promotionCode: {
    type: String,
    required: [true, 'Promotion code is required'],
    minlength: [1, 'Promotion code must be at least 1 character'],
    unique: true,
    uppercase: true,
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
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
    index: true
  },
  promotionType: {
    type: String,
    required: [true, 'Promotion type is required'],
    enum: ['fixed', 'percentage', 'free_shipping', 'bundle'],
    index: true
  },
  promotionAmount: {
    type: Number,
    required: [true, 'Promotion amount is required'],
    min: [0, 'Promotion amount cannot be negative'],
    validate: {
      validator: function(v) {
        if (this.promotionType === 'percentage') {
          return v <= 100;
        }
        return true;
      },
      message: 'Percentage discount cannot exceed 100%'
    }
  },
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
        return this.promotionType === 'percentage' ? true : !v;
      },
      message: 'Max discount only applies to percentage discounts'
    }
  },
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Product.Category'
  }],
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  singleUsePerCustomer: {
    type: Boolean,
    default: false
  },
  customerEligibility: {
    type: String,
    enum: ['all', 'new_customers', 'returning_customers', 'specific_customers'],
    default: 'all'
  },
  eligibleCustomers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
promotionCodeSchema.index({ startDate: 1, endDate: 1 });
promotionCodeSchema.index({ status: 1, promotionType: 1 });

// Middleware
promotionCodeSchema.pre('save', function(next) {
  const now = new Date();
  if (this.endDate < now) {
    this.status = 'expired';
  } else if (this.startDate > now) {
    this.status = 'inactive';
  }
  next();
});

// Virtuals
promotionCodeSchema.virtual('remainingUses').get(function() {
  return this.usageLimit ? this.usageLimit - this.usageCount : null;
});

module.exports = promotionCodeSchema;