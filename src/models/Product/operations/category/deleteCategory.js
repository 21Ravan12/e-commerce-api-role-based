async function deleteCategory(Category, mongoose, categoryId, user, ip, userAgent) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error('Invalid category ID');
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Check if category has products
  const productCount = await mongoose.model('Product').countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new Error('Cannot delete category with associated products');
  }

  // Check if category has children
  const childCount = await Category.countDocuments({ parentCategory: category._id });
  if (childCount > 0) {
    throw new Error('Cannot delete category with subcategories');
  }

  // Perform deletion
  await Category.deleteOne({ _id: category._id });

  return {
    deletedId: category._id,
    auditLogData: {
      event: 'CATEGORY_DELETED',
      action: 'delete',
      entityType: 'category',
      entityId: category._id,
      user: user?._id,
      source: 'web',
      ip,
      userAgent,
      metadata: {
        categoryName: category.name,
        parentCategory: category.parentCategory
      }
    }
  };
}

module.exports = deleteCategory;