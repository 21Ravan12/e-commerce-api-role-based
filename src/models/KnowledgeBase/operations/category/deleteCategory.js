const deleteCategory = async (Category, Article, categoryId) => {
    try {
      // Check if category has articles
      const articleCount = await Article.countDocuments({ category: categoryId });
      if (articleCount > 0) {
        return {
          success: false,
          error: 'Cannot delete category with articles'
        };
      }

      // Check if category has children
      const childCount = await Category.countDocuments({ parent: categoryId });
      if (childCount > 0) {
        return {
          success: false,
          error: 'Cannot delete category with subcategories'
        };
      }

      const category = await Category.findByIdAndDelete(categoryId);
      
      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      return {
        success: true,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = deleteCategory;