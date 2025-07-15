const { Schema } = require('mongoose');

const productSchema = new Schema({
  // Core Product Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    minlength: [3, 'Product name must be at least 3 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    default: null,
    validate: {
      validator: function(v) {
        return v === null || v < this.price;
      },
      message: 'Discounted price must be less than regular price'
    },
    set: v => v === null ? null : parseFloat(v.toFixed(2))
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
    set: v => parseFloat(v.toFixed(2))
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL', 'MXN'],
    uppercase: true,
    trim: true
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    default: 0
  },

  // Inventory & Availability
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    min: [0, 'Low stock threshold cannot be negative'],
    default: 5
  },
  sku: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [50, 'SKU cannot exceed 50 characters'],
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    maxlength: [50, 'Barcode cannot exceed 50 characters'],
    index: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  digitalDownloadUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (this.isDigital) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        }
        return true;
      },
      message: props => `${props.value} is not a valid URL`
    }
  },
  maxDownloads: {
    type: Number,
    min: [0, 'Max downloads cannot be negative'],
    default: 3
  },
  downloadExpiryDays: {
    type: Number,
    min: [0, 'Download expiry days cannot be negative'],
    default: 30
  },

  // Media
  images: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid URL`
      }
    },
    altText: {
      type: String,
      maxlength: [100, 'Alt text cannot exceed 100 characters'],
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  videos: [{
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid URL`
      }
    },
    platform: {
      type: String,
      enum: ['youtube', 'vimeo', 'dailymotion', 'other'],
      default: 'other'
    },
    thumbnail: {
      type: String
    }
  }],
  documents: [{
    name: {
      type: String,
      maxlength: [100, 'Document name cannot exceed 100 characters']
    },
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid URL`
      }
    },
    type: {
      type: String,
      enum: ['manual', 'specsheet', 'certificate', 'other']
    }
  }],

  // Categorization
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Product.Category',
    required: [true, 'At least one category is required'],
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  collections: [{
    type: Schema.Types.ObjectId,
    ref: 'Collection'
  }],

  // Seller Information
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  warranty: {
    type: {
      duration: {
        type: Number,
        min: [0, 'Warranty duration cannot be negative']
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'years']
      },
      terms: {
        type: String,
        maxlength: [500, 'Warranty terms cannot exceed 500 characters']
      }
    }
  },

  // Product Specifications
  specifications: [{
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Spec key cannot exceed 50 characters']
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Spec value cannot exceed 200 characters']
    },
    group: {
      type: String,
      trim: true,
      maxlength: [30, 'Spec group cannot exceed 30 characters']
    },
    priority: {
      type: Number,
      default: 0
    }
  }],
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [30, 'Attribute name cannot exceed 30 characters']
    },
    values: [{
      type: String,
      trim: true,
      maxlength: [30, 'Attribute value cannot exceed 30 characters']
    }]
  }],
  parentProduct: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    default: 0
  },
  weightUnit: {
    type: String,
    enum: ['g', 'kg', 'lb', 'oz'],
    default: 'g'
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    unit: {
      type: String,
      enum: ['cm', 'in', 'm', 'mm'],
      default: 'cm'
    }
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  size: {
    type: String,
    trim: true,
    maxlength: [20, 'Size cannot exceed 20 characters']
  },
  material: {
    type: String,
    trim: true,
    maxlength: [100, 'Material cannot exceed 100 characters']
  },

  // Shipping Information
  shippingInfo: {
    isFreeShipping: {
      type: Boolean,
      default: false
    },
    weight: {
      type: Number,
      min: [0, 'Shipping weight cannot be negative']
    },
    dimensions: {
      type: {
        type: String,
        enum: ['parcel', 'envelope', 'package', 'pallet'],
        default: 'parcel'
      }
    },
    handlingTime: {
      type: Number,
      min: [0, 'Handling time cannot be negative'],
      default: 1,
      max: [30, 'Handling time cannot exceed 30 days']
    },
    shippingClass: {
      type: String,
      trim: true
    },
    restrictions: {
      countries: [{
        type: String,
        trim: true,
        uppercase: true
      }],
      zipCodes: [{
        type: String,
        trim: true
      }]
    }
  },

  // Related Products
  relatedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSellProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  frequentlyBoughtTogether: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // Ratings & Reviews
  averageRating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0,
    set: v => parseFloat(v.toFixed(1))
  },
  ratingCount: {
    type: Number,
    min: [0, 'Rating count cannot be negative'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },

  // Sales & Pricing History
  saleCount: {
    type: Number,
    min: [0, 'Sale count cannot be negative'],
    default: 0
  },
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    isDiscount: {
      type: Boolean,
      default: false
    }
  }],

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return v > this.publishedAt;
      },
      message: 'Expiry date must be after publish date'
    }
  },

  // Moderation & Status
  status: {
    type: String,
    enum: ['draft', 'active', 'published', 'unpublished', 'archived', 'banned', 'discontinued'],
    default: 'draft'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  approvalDate: {
    type: Date
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // SEO
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [70, 'SEO title cannot exceed 70 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true,
    maxlength: [30, 'SEO keyword cannot exceed 30 characters']
  }],
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain letters, numbers and hyphens']
  },
  metaRobots: {
    type: String,
    default: 'index, follow',
    enum: [
      'index, follow',
      'noindex, follow',
      'index, nofollow',
      'noindex, nofollow'
    ]
  },
  canonicalUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: props => `${props.value} is not a valid URL`
    }
  },

  // Analytics
  viewCount: {
    type: Number,
    min: [0, 'View count cannot be negative'],
    default: 0
  },
  purchaseCount: {
    type: Number,
    min: [0, 'Purchase count cannot be negative'],
    default: 0
  },
  wishlistCount: {
    type: Number,
    min: [0, 'Wishlist count cannot be negative'],
    default: 0
  },
  conversionRate: {
    type: Number,
    min: [0, 'Conversion rate cannot be negative'],
    max: [100, 'Conversion rate cannot exceed 100%'],
    default: 0
  },
  lastViewed: {
    type: Date
  },

  // Custom Fields
  customFields: [{
    fieldName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Field name cannot exceed 50 characters']
    },
    fieldValue: {
      type: Schema.Types.Mixed
    },
    fieldType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'date', 'array', 'object']
    }
  }],

  // Localization
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar']
  },
  localizedVersions: [{
    language: {
      type: String,
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  }],

  // Audit Log
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// ======================
// INDEXES
// ======================
productSchema.index({ name: 'text', description: 'text', tags: 'text', 'specifications.value': 'text' });
productSchema.index({ price: 1 });
productSchema.index({ price: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ categories: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'shippingInfo.restrictions.countries': 1 });
productSchema.index({ isDigital: 1 });
productSchema.index({ 'attributes.name': 1, 'attributes.values': 1 });

// ======================
// MIDDLEWARE
// ======================
productSchema.pre('save', async function(next) {
  try {
    // 1. Primary Image Validation
    if (this.isModified('images')) {
      const primaryCount = this.images.filter(img => img.isPrimary).length;
      
      if (primaryCount > 1) {
        throw new Error('Only one image can be marked as primary');
      }
      
      if (primaryCount === 0 && this.images.length > 0) {
        this.images[0].isPrimary = true;
      }
    }

    // 2. SKU Generation/Validation
    if (!this.sku) {
      // Auto-generate SKU if not provided
      const prefix = this.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      this.sku = `${prefix}-${randomSuffix}`;
    } else {
      // Validate existing SKU format
      const skuRegex = /^[A-Z0-9]{3,}-[A-Z0-9]{3,}$/;
      if (!skuRegex.test(this.sku)) {
        throw new Error('SKU must be in format ABC-1234 (letters-numbers separated by hyphen)');
      }
      
      // Check for SKU uniqueness
      const existingProduct = await this.constructor.findOne({ 
        sku: this.sku, 
        _id: { $ne: this._id } // Exclude current product for updates
      });
      
      if (existingProduct) {
        throw new Error('SKU must be unique - this SKU already exists');
      }
    }

    // 3. Slug Generation with ID fallback
    if (!this.slug || this.isModified('name')) {
      let baseSlug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (this.isNew || this.isModified('name')) {
        const slugRegex = new RegExp(`^${baseSlug}(-[0-9]*)?$`, 'i');
        const productsWithSlug = await this.constructor.find({ slug: slugRegex });
        
        if (productsWithSlug.length > 0) {
          if (this.isNew) {
            baseSlug = `${baseSlug}-${this._id.toString().slice(-4)}`;
          } else {
            const existingNumbers = productsWithSlug
              .map(p => parseInt(p.slug.match(/-(\d+)$/)?.[1] || 0))
              .filter(n => !isNaN(n));
            
            const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
            baseSlug = `${baseSlug}-${maxNumber + 1}`;
          }
        }
      }
      
      this.slug = baseSlug;
    }

    // 4. PublishedAt Update
    if (this.isModified('status') && this.status === 'published') {
      this.publishedAt = new Date();
    }

    // 5. Availability Update
    if (this.isModified('stockQuantity')) {
      this.isAvailable = this.stockQuantity > 0;
    }

    // 6. Digital product validation
    if (this.isDigital && !this.digitalDownloadUrl) {
      throw new Error('Digital products must have a download URL');
    }

    // 7. Update version number on changes
    if (this.isModified() && !this.isNew) {
      this.version += 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Update price history when price changes
productSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discountedPrice')) {
    const newPrice = this.discountedPrice !== null ? this.discountedPrice : this.price;
    const isDiscount = this.discountedPrice !== null;
    
    if (!this.priceHistory) {
      this.priceHistory = [];
    }
    
    this.priceHistory.push({
      price: newPrice,
      date: new Date(),
      isDiscount
    });
  }
  next();
});

// ======================
// VIRTUALS
// ======================
productSchema.virtual('discountPercentage').get(function() {
  if (!this.discountedPrice || this.discountedPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

productSchema.virtual('isInStock').get(function() {
  return this.stockQuantity > 0;
});

productSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity > 0 && this.stockQuantity <= this.lowStockThreshold;
});

productSchema.virtual('isNewArrival').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.publishedAt >= thirtyDaysAgo;
});

productSchema.virtual('taxAmount').get(function() {
  const priceToUse = this.discountedPrice !== null ? this.discountedPrice : this.price;
  return parseFloat((priceToUse * (this.taxRate / 100)).toFixed(2));
});

productSchema.virtual('totalPrice').get(function() {
  const priceToUse = this.discountedPrice !== null ? this.discountedPrice : this.price;
  return parseFloat((priceToUse + (priceToUse * (this.taxRate / 100))).toFixed(2));
});

productSchema.virtual('profitMargin').get(function() {
  if (!this.costPrice) return null;
  const priceToUse = this.discountedPrice !== null ? this.discountedPrice : this.price;
  return parseFloat(((priceToUse - this.costPrice) / priceToUse * 100).toFixed(2));
});

productSchema.virtual('sellerInfo', {
  ref: 'User',
  localField: 'seller',
  foreignField: '_id',
  justOne: true
});

productSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'categories',
  foreignField: '_id'
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

// ======================
// METHODS
// ======================
productSchema.methods = {
  incrementStock: function(quantity) {
    this.stockQuantity += quantity;
    this.isAvailable = this.stockQuantity > 0;
    return this.save();
  },
  
  decrementStock: function(quantity) {
    if (this.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stockQuantity -= quantity;
    this.isAvailable = this.stockQuantity > 0;
    return this.save();
  },
  
  addReview: async function(rating, reviewId) {
    // Update rating distribution
    this.ratingDistribution[rating] = (this.ratingDistribution[rating] || 0) + 1;
    
    // Recalculate average rating
    const totalRatings = Object.values(this.ratingDistribution).reduce((sum, count) => sum + count, 0);
    const sumRatings = Object.entries(this.ratingDistribution)
      .reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0);
    
    this.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
    this.ratingCount = totalRatings;
    this.reviewCount += 1;
    
    await this.save();
  },
  
  removeReview: async function(rating) {
    if (this.ratingDistribution[rating] > 0) {
      this.ratingDistribution[rating] -= 1;
      
      const totalRatings = Object.values(this.ratingDistribution).reduce((sum, count) => sum + count, 0);
      
      if (totalRatings > 0) {
        const sumRatings = Object.entries(this.ratingDistribution)
          .reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0);
        this.averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
      } else {
        this.averageRating = 0;
      }
      
      this.ratingCount = totalRatings;
      this.reviewCount = Math.max(0, this.reviewCount - 1);
      
      await this.save();
    }
  },
  
  addToRelatedProducts: async function(productId) {
    if (!this.relatedProducts.includes(productId)) {
      this.relatedProducts.push(productId);
      await this.save();
    }
  },
  
  generateDownloadToken: function() {
    if (!this.isDigital) {
      throw new Error('Only digital products can generate download tokens');
    }
    
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + this.downloadExpiryDays);
    
    return {
      token,
      expiry,
      maxDownloads: this.maxDownloads
    };
  }
};

module.exports = productSchema;