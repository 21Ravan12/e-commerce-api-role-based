const { Schema } = require('mongoose');
const slugify = require('slugify');

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [8, 'Description must be at least 8 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Product.Category',
    default: null
  },
  image: {
    type: String,
    validate: {
      validator: v => /\.(jpg|jpeg|png|webp|svg)$/i.test(v),
      message: 'Image must be JPG, PNG, WEBP, or SVG'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
      trim: true
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      trim: true
    },
    keywords: [String]
  },
  attributes: [{
    type: Schema.Types.ObjectId,
    ref: 'Attribute'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Virtuals
categorySchema.virtual('subcategories', {
  ref: 'Product.Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Add query helpers
categorySchema.query.byName = function(name) {
  return this.where({ name: new RegExp(name, 'i') });
};

categorySchema.query.byParent = function(parentId) {
  return this.where({ parentCategory: parentId });
};

categorySchema.query.activeOnly = function() {
  return this.where({ isActive: true });
};

categorySchema.query.byDisplayOrder = function(order = 'asc') {
  return this.sort({ displayOrder: order === 'asc' ? 1 : -1 });
};

// Indexes
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

module.exports = categorySchema;