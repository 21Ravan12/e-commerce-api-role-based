const updateCategory = async (Category, categoryId, updateData) => {
    try {
      const category = await Category.findById(categoryId);
      
      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      // Prevent circular references
      if (updateData.parent && updateData.parent.toString() === categoryId.toString()) {
        return {
          success: false,
          error: 'Category cannot be its own parent'
        };
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== '__v') {
          category[key] = updateData[key];
        }
      });

      await category.save();

      return {
        success: true,
        data: category,
        message: 'Category updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = updateCategory;