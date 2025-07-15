const listCategories = async (Category, { 
    parent = null,
    isActive = true,
    includeTree = false
  } = {}) => {
    try {
      const query = { isActive };
      if (parent !== null) {
        query.parent = parent;
      }

      let categories;
      if (includeTree) {
        categories = await Category.aggregate([
          { $match: query },
          { $graphLookup: {
              from: 'categories',
              startWith: '$_id',
              connectFromField: '_id',
              connectToField: 'parent',
              as: 'children',
              depthField: 'depth'
            }
          },
          { $match: { parent: parent } } // Filter to only root categories
        ]);
      } else {
        categories = await Category.find(query)
          .sort({ displayOrder: 1, name: 1 })
          .populate('parent', 'name slug')
          .lean();
      }

      return {
        success: true,
        data: categories,
        count: categories.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

module.exports = listCategories;