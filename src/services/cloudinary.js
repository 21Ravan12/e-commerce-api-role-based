// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (replace with your credentials)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload helper function
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Delete asset from Cloudinary
const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, options);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

// Reorder assets in a folder (Cloudinary doesn't have direct reorder, but we can use rename)
const reorderCloudinaryAssets = async (publicIds, folder = '') => {
  try {
    // This is a workaround since Cloudinary doesn't have a direct reorder API
    // You might need to implement your own sorting logic in your application
    // and use the rename function if needed
    const results = [];
    
    for (let i = 0; i < publicIds.length; i++) {
      const newPublicId = `${folder}${i}_${publicIds[i].split('/').pop().replace(/^\d+_/, '')}`;
      const result = await cloudinary.uploader.rename(publicIds[i], newPublicId);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    throw new Error(`Cloudinary reorder failed: ${error.message}`);
  }
};

// Get resources from a folder (useful for reordering)
const getCloudinaryResources = async (folder = '', options = {}) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500, // Adjust as needed
      ...options
    });
    return result.resources;
  } catch (error) {
    throw new Error(`Cloudinary resources fetch failed: ${error.message}`);
  }
};

module.exports = { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  reorderCloudinaryAssets,
  getCloudinaryResources
};