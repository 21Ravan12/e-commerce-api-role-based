const mongoose = require('mongoose'); 
const getCategory = async (Category, categoryIdOrSlug) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(categoryIdOrSlug) 
        ? { _id: categoryIdOrSlug }
        : { slug: categoryIdOrSlug };

      const category = await Category.findOne(query)
        .populate('parent', 'name slug');

      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = getCategory;