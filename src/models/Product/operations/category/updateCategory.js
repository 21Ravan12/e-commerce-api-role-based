async function updateCategory(Category, categoryId, data, user, ip, userAgent) {
  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Check for duplicate name if name is being updated
  if (data.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      _id: { $ne: categoryId }
    });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
  }

  // Validate parent category if provided
  if (data.parentCategory !== undefined) {
    if (data.parentCategory && data.parentCategory === categoryId) {
      throw new Error('Category cannot be its own parent');
    }
    if (data.parentCategory) {
      const parentExists = await Category.exists({ _id: data.parentCategory });
      if (!parentExists) {
        throw new Error('Parent category not found');
      }
    }
  }

  // Save old values for audit log
  const oldValues = {
    name: category.name,
    isActive: category.isActive,
    parentCategory: category.parentCategory
  };

  // Update category
  Object.assign(category, data);
  const updatedCategory = await category.save();

  return {
    category: updatedCategory,
    auditLogData: {
      event: 'CATEGORY_UPDATED',
      action: 'update',
      entityType: 'category',
      entityId: category._id,
      user: user?._id,
      source: 'web',
      ip,
      userAgent,
      metadata: {
        oldValues,
        newValues: {
          name: updatedCategory.name,
          isActive: updatedCategory.isActive,
          parentCategory: updatedCategory.parentCategory
        },
        changedFields: Object.keys(data)
      }
    }
  };
}

module.exports = updateCategory;