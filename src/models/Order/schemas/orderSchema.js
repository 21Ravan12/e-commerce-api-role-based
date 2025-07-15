const { Schema } = require('mongoose');
const { Product } = require('../../Product');

const orderItemSchema = new Schema({
  idProduct: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    validate: {
      validator: async function(v) {
        const product = await Product.findById(v);
        return !!product;
      },
      message: 'Product ID must reference a valid product'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: async function(v) {
        const product = await Product.findById(this.idProduct);
        return product && v <= product.stockQuantity;
      },
      message: 'Quantity exceeds available stock'
    }
  },
  priceAtPurchase: {
    type: Number,
    required: [true, 'Purchase price must be recorded']
  },
}, { _id: false });

const orderSchema = new Schema({
  // Core Fields
  idCustomer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required'],
    index: true
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: v => v.length > 0,
      message: 'Order must contain at least one item'
    }
  },

  // Order Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['credit_card','paypal', 'stripe', 'cod', 'bank_transfer', 'cash_on_delivery'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  cancellationReason: {
    type: String,
    default: null
  },
  // Shipping Information
  shippingAddress: {
    type: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    required: [true, 'Shipping address is required']
  },
  trackingNumber: String,
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },

  // Financials
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0.01, 'Subtotal must be positive']
  },
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative']
  },
  shippingCost: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total must be positive']
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ idCustomer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: 1 });

// Virtuals
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = orderSchema;