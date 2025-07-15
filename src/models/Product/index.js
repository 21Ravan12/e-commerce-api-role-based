const mongoose = require('mongoose');
const productSchema = require('./schemas/productSchema');
const commentSchema = require('./schemas/commentSchema');
const categorySchema = require('./schemas/categorySchema');

// Register model if not already registered
const Category = mongoose.models.ProductCategory || mongoose.model('Product.Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Comment = mongoose.models.ProductComment || mongoose.model('Product.Comment', commentSchema);

// Product CRUD Operations
const createProduct = require('./operations/product/createProduct');
const getProduct = require('./operations/product/getProduct');
const updateProduct = require('./operations/product/updateProduct');
const deleteProduct = require('./operations/product/deleteProduct');

// Product Listing & Search Operations
const listProducts = require('./operations/listing&search/listProducts');
const searchProducts = require('./operations/listing&search/searchProducts');

// Product Media Operations
const uploadProductMedia = require('./operations/mediaManagement/uploadProductMedia');
const deleteProductMedia = require('./operations/mediaManagement/deleteProductMedia');
const reorderProductMedia = require('./operations/mediaManagement/reorderProductMedia');

// Advanced search operations
const getProductsByCategory = require('./operations/advancedSearch/getProductsByCategory');
const getFeaturedProducts = require('./operations/advancedSearch/getFeaturedProducts');
const getRelatedProducts = require('./operations/advancedSearch/getRelatedProducts');
const getSimilarProducts = require('./operations/advancedSearch/getSimilarProducts');
const getFrequentlyBoughtTogether = require('./operations/advancedSearch/getFrequentlyBoughtTogether');
const getTrendingProducts = require('./operations/advancedSearch/getTrendingProducts');
const getNewArrivals = require('./operations/advancedSearch/getNewArrivals');
const getBestSellers = require('./operations/advancedSearch/getBestSellers');
const getDiscountedProducts = require('./operations/advancedSearch/getDiscountedProducts');
const getLowStockProducts = require('./operations/inventoryManagement/getLowStockProducts');
const getOutOfStockProducts = require('./operations/inventoryManagement/getOutOfStockProducts');

// Inventory Management Operations
const bulkUpdateStock = require('./operations/inventoryManagement/bulkUpdateStock');
const bulkUpdatePrices = require('./operations/inventoryManagement/bulkUpdatePrices');

// Comment Operations
const addComment = require('./operations/comment/addComment');
const getComments = require('./operations/comment/getComments');
const getComment = require('./operations/comment/getComment');
const updateComment = require('./operations/comment/updateComment');
const deleteComment = require('./operations/comment/deleteComment');

// Comment Operations
const addCategory = require('./operations/category/addCategory');
const updateCategory = require('./operations/category/updateCategory');
const fetchCategory = require('./operations/category/fetchCategory');
const fetchCategories = require('./operations/category/fetchCategories');
const deleteCategory = require('./operations/category/deleteCategory');
const initializeRootCategory = require('./operations/category/initializeRootCategory');

// Export initialized model and operations
module.exports = {
  Product,
  Comment,
  Category, 

  createProduct: createProduct.bind(null, Product, Category),
  getProduct: getProduct.bind(null, Product),
  updateProduct: updateProduct.bind(null, Product),
  deleteProduct: deleteProduct.bind(null, Product),
  listProducts: listProducts.bind(null, Product),
  searchProducts: searchProducts.bind(null, Product),
  uploadProductMedia: uploadProductMedia.bind(null, Product),
  deleteProductMedia: deleteProductMedia.bind(null, Product),
  reorderProductMedia: reorderProductMedia.bind(null, Product),
  getProductsByCategory: getProductsByCategory.bind(null, Product),
  getFeaturedProducts: getFeaturedProducts.bind(null, Product),
  bulkUpdateStock: bulkUpdateStock.bind(null, Product),
  bulkUpdatePrices: bulkUpdatePrices.bind(null, Product),
  getRelatedProducts: getRelatedProducts.bind(null, Product),
  getSimilarProducts: getSimilarProducts.bind(null, Product),
  getFrequentlyBoughtTogether: getFrequentlyBoughtTogether.bind(null, Product),
  getTrendingProducts: getTrendingProducts.bind(null, Product),
  getNewArrivals: getNewArrivals.bind(null, Product),
  getBestSellers: getBestSellers.bind(null, Product),
  getDiscountedProducts: getDiscountedProducts.bind(null, Product),
  getLowStockProducts: getLowStockProducts.bind(null, Product),
  getOutOfStockProducts: getOutOfStockProducts.bind(null, Product),

  addComment: addComment.bind(null, Product, Comment),
  getComments: getComments.bind(null, Comment),
  getComment: getComment.bind(null, Comment),
  updateComment: updateComment.bind(null, Product, Comment),
  deleteComment: deleteComment.bind(null, Product, Comment),

  // Category Operations
  addCategory: addCategory.bind(null, Category),
  updateCategory: updateCategory.bind(null, Category),
  fetchCategory: fetchCategory.bind(null, Category, mongoose),
  fetchCategories: fetchCategories.bind(null, Category, mongoose),
  deleteCategory: deleteCategory.bind(null, Category, mongoose),
  initializeRootCategory: initializeRootCategory.bind(null, Category, mongoose)
};