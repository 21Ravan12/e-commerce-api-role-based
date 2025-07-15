async function fetchCategory(Category, mongoose, categoryId, options = {}) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error('Invalid category ID');
  }

  // Build query based on options
  const query = Category.findById(categoryId)
    .populate('parentCategory', 'name slug');

  // For admin requests, include all fields
  if (options.admin === true) {
    query.select('+seo +isActive +displayOrder');
  }

  const category = await query;

  if (!category) {
    throw new Error('Category not found');
  }

  // Add virtuals to response
  const categoryData = category.toObject();
  categoryData.links = {
    self: `/categories/${category.slug}`,
    products: `/products?category=${category.slug}`
  };

  if (options.includeChildren) {
    const children = await Category.find({ parentCategory: category._id })
      .select('name slug image');
    categoryData.children = children;
  }

  return categoryData;
}

module.exports = fetchCategory;