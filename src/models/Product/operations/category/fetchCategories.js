async function fetchCategories(Category, mongoose, {
  page = 1,
  limit = 25,
  isActive,
  parentCategory,
  hasProducts,
  search,
  includeChildren = false,
  admin = false,
  sort = 'displayOrder:asc'
}) {
  // Setup pagination
  const skip = (page - 1) * limit;
  
  // Build filter criteria
  const filter = {};
  
  // Active status filter
  if (isActive === 'true' || isActive === true) {
    filter.isActive = true;
  } else if (isActive === 'false' || isActive === false) {
    filter.isActive = false;
  }

  // Parent category filter
  if (parentCategory) {
    if (parentCategory === 'null' || parentCategory === null) {
      filter.parentCategory = null;
    } else if (mongoose.Types.ObjectId.isValid(parentCategory)) {
      filter.parentCategory = parentCategory;
    }
  }

  // Search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Configure sorting
  const sortOptions = {};
  const [sortField, direction] = sort.split(':');
  
  const validSortFields = ['name', 'displayOrder', 'createdAt', 'updatedAt'];
  if (validSortFields.includes(sortField)) {
    sortOptions[sortField] = direction === 'asc' ? 1 : -1;
  }

  // Build base query
  const query = Category.find(filter)
    .populate('parentCategory', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // For admin requests, include all fields
  if (admin) {
    query.select('+seo +isActive +displayOrder');
  }

  // Execute queries in parallel
  const [categories, total] = await Promise.all([
    query.lean({ virtuals: true }),
    Category.countDocuments(filter)
  ]);

  if (!categories || categories.length === 0) {
    throw new Error('No categories found');
  }

  // Process categories to add links and virtuals
  const categoriesData = categories.map(category => {
    const categoryData = {
      ...category,
      links: {
        self: `/categories/${category.slug}`,
        products: `/products?category=${category.slug}`
      }
    };
    return categoryData;
  });

  // Optionally include children if requested
  if (includeChildren) {
    await Promise.all(categoriesData.map(async category => {
      const children = await Category.find({ parentCategory: category._id })
        .select('name slug image isActive')
        .lean();
      category.children = children;
    }));
  }

  // Optionally check for products if requested
  if (hasProducts === 'true' || hasProducts === true) {
    await Promise.all(categoriesData.map(async category => {
      const productCount = await mongoose.model('Product').countDocuments({ 
        category: category._id 
      });
      category.hasProducts = productCount > 0;
    }));
  }

  return {
    categories: categoriesData,
    total,
    page,
    pages: Math.ceil(total / limit),
    filters: {
      isActive,
      parentCategory,
      search,
      includeChildren
    }
  };
}

module.exports = fetchCategories;