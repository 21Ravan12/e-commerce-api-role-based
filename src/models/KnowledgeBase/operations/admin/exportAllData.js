const exportAllData = async (Article, Category, Feedback, Rating, format = 'json') => {
  try {
    const data = {
      articles: await Article.find({}).lean(),
      categories: await Category.find({}).lean(),
      feedback: await Feedback.find({}).lean(),
      ratings: await Rating.find({}).lean(),
      exportedAt: new Date()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // This is a simplified example - you'd need a proper CSV conversion library
      const { Parser } = require('json2csv');
      const parser = new Parser();
      return parser.parse(data);
    } else {
      throw new Error('Unsupported export format');
    }
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
};

module.exports = exportAllData;