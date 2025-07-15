const rebuildSearchIndex = async (Article, adminId) => {
  try {
    // Drop existing text index
    await Article.collection.dropIndex('title_text_content_text_tags_text');

    // Create new text index
    await Article.collection.createIndex(
      { title: 'text', content: 'text', tags: 'text' },
      { weights: { title: 10, tags: 5, content: 1 } }
    );

    return { success: true, message: 'Search index rebuilt successfully' };
  } catch (error) {
    throw new Error(`Search index rebuild failed: ${error.message}`);
  }
};

module.exports = rebuildSearchIndex;