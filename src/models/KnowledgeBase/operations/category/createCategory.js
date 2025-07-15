const createCategory = async (Category, categoryData) => {
    try {
      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = categoryData.name.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const category = new Category(categoryData);
      await category.save();
      
      return {
        success: true,
        data: category,
        message: 'Category created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = createCategory;