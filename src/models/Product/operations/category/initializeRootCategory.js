async function initializeRootCategory(Category) {
  try {
    const count = await Category.countDocuments();
    
    if (count === 0) {
      const rootCategory = new Category({
        name: 'Main Category',
        description: 'The primary root category for all products',
        isActive: true,
        displayOrder: 0,
        seo: {
          metaTitle: 'Main Product Category',
          metaDescription: 'Browse all products in our main category'
        }
      });

      await rootCategory.save();
      return rootCategory;
    }

    return null;
  } catch (error) {
    throw error;
  }
}

module.exports = initializeRootCategory;