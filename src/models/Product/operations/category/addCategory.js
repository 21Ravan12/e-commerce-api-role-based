async function addCategory(Category, data, user, ip, userAgent) {
  // Check for duplicate category name
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${data.name}$`, 'i') } 
  });
  
  if (existingCategory) {
    throw new Error('Category with this name already exists');
  }

  // Validate parent category if provided
  if (data.parentCategory) {
    const parentExists = await Category.exists({ _id: data.parentCategory });
    if (!parentExists) {
      throw new Error('Parent category not found');
    }
  }

  // Create the category
  const newCategory = new Category({
    name: data.name,
    description: data.description,
    parentCategory: data.parentCategory || null,
    image: data.image || undefined,
    isActive: data.isActive,
    displayOrder: data.displayOrder,
    seo: data.seo || undefined,
    attributes: data.attributes || []
  });

  await newCategory.save();

  return {
    category: newCategory,
    auditLogData: {
      event: 'CATEGORY_CREATED',
      action: 'create',
      entityType: 'category',
      entityId: newCategory._id,
      user: user?._id,
      source: 'web',
      ip,
      userAgent,
      metadata: {
        categoryName: newCategory.name,
        parentCategory: newCategory.parentCategory
      }
    }
  };
}

module.exports = addCategory;