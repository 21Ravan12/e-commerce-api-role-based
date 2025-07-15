// reorder product media (images/videos) to local storage or cloud storage(e.g., Cloudinary after line 72).
const fs = require('fs');
const path = require('path');

async function reorderProductMedia(Product, productId, mediaIds, user) {
  if (!mediaIds || !Array.isArray(mediaIds)) {
    throw new Error('mediaIds array is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check ownership
  if (user.role === 'seller' && String(product.seller) !== String(user._id)) {
    throw new Error('Not authorized to update this product', 403);
  }

  // Create a map of all media IDs to their index for quick lookup
  const mediaIndexMap = {};
  product.images.forEach((img, index) => {
    mediaIndexMap[img._id.toString()] = index;
  });

  // Verify all mediaIds exist in the product
  const invalidIds = mediaIds.filter(id => !mediaIndexMap.hasOwnProperty(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid media IDs: ${invalidIds.join(', ')}`);
  }

  // Reorder images
  const orderedImages = [];
  const remainingImages = [...product.images];
  
  // Add images in the new order
  mediaIds.forEach(id => {
    const originalIndex = mediaIndexMap[id];
    if (originalIndex !== undefined) {
      orderedImages.push(product.images[originalIndex]);
    }
  });

  // Add any remaining images that weren't in the mediaIds array
  product.images = [
    ...orderedImages,
    ...remainingImages.filter(img => !mediaIds.includes(img._id.toString()))
  ];

  // Update order property sequentially
  product.images.forEach((img, index) => {
    img.order = index;
  });

  product.lastUpdatedBy = user._id;
  await product.save();

  return {
    productId: product._id,
    reorderedImages: product.images,
  };
}

module.exports = reorderProductMedia;

// Alternative using Cloudinary
/*const { reorderCloudinaryAssets, getCloudinaryResources } = require('../utils/cloudinary');

async function reorderProductMedia(Product, productId, mediaIds, user) {
  if (!mediaIds || !Array.isArray(mediaIds)) {
    throw new Error('mediaIds array is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check ownership (sellers can only update their own products)
  if (user.role === 'seller' && String(product.seller) !== String(user._id)) {
    throw new Error('Not authorized to update this product', 403);
  }

  // Get current Cloudinary assets for this product
  const folder = `products/${productId}/`;
  const cloudinaryResources = await getCloudinaryResources(folder);

  // Create mapping of our media IDs to Cloudinary public IDs
  const mediaToCloudinaryMap = {};
  product.images.forEach(image => {
    if (image.publicId) {
      mediaToCloudinaryMap[image._id.toString()] = image.publicId;
    }
  });

  // Filter and order the Cloudinary public IDs based on the mediaIds order
  const orderedPublicIds = [];
  mediaIds.forEach(mediaId => {
    if (mediaToCloudinaryMap[mediaId]) {
      orderedPublicIds.push(mediaToCloudinaryMap[mediaId]);
    }
  });

  // Reorder assets in Cloudinary
  if (orderedPublicIds.length > 0) {
    await reorderCloudinaryAssets(orderedPublicIds, folder);
  }

  // Reorder images in our database
  const orderedImages = [];
  const remainingImages = [...product.images];

  mediaIds.forEach(id => {
    const index = remainingImages.findIndex(img => img._id.toString() === id);
    if (index !== -1) {
      orderedImages.push(remainingImages[index]);
      remainingImages.splice(index, 1);
    }
  });

  // Update product with new order
  product.images = [...orderedImages, ...remainingImages];
  product.lastUpdatedBy = user._id;
  await product.save();

  // Refresh Cloudinary public IDs in case they changed during reordering
  const updatedResources = await getCloudinaryResources(folder);
  const publicIdMap = {};
  updatedResources.forEach(res => {
    const filename = res.public_id.split('/').pop();
    publicIdMap[filename] = res.public_id;
  });

  // Update product images with potentially new public IDs
  product.images = product.images.map(img => {
    if (img.filename) {
      const newPublicId = publicIdMap[img.filename];
      if (newPublicId) {
        img.publicId = newPublicId;
        img.url = res.secure_url;
      }
    }
    return img;
  });

  await product.save();

  return {
    productId: product._id,
    reorderedImages: product.images,
  };
}

module.exports = reorderProductMedia;*/