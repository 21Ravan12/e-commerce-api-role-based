const { Schema } = require('mongoose');

const returnRequestSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required'],
    index: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    index: true,
  },
  reason: {
    type: String,
    required: [true, 'Return reason is required'],
    maxlength: [255, 'Reason cannot exceed 255 characters'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'refunded', 'completed', 'archived'],
    default: 'pending',
    index: true,
  },
  returnType: {
    type: String,
    enum: ['refund', 'exchange', 'store_credit'],
    required: [true, 'Return type is required'],
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
  },
  exchangeProductId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  trackingNumber: {
    type: String,
  },
  returnShippingMethod: {
    type: String,
    enum: ['customer', 'merchant', 'pickup'],
    default: 'customer',
  },
  returnLabelProvided: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
returnRequestSchema.index({ customerId: 1, status: 1 });
returnRequestSchema.index({ orderId: 1, status: 1 });
returnRequestSchema.index({ status: 1, createdAt: -1 });

// Middleware
returnRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && ['completed', 'refunded'].includes(this.status)) {
    this.resolvedAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

// Virtuals
returnRequestSchema.virtual('customer', {
  ref: 'User',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

returnRequestSchema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true,
});

module.exports = returnRequestSchema;