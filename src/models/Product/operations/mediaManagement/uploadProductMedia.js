// Upload product media (images/videos) to local storage or cloud storage(e.g., Cloudinary after line 72).
const fs = require('fs');
const path = require('path');

async function uploadProductMedia(Product, productId, files, user) {
  console.log('Uploading product media:', { productId, files, user });

  // Validate files exist and have content
  if (!files || files.length === 0 || files.some(f => !f || f.size === 0)) {
    throw new Error('No valid files uploaded');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Authorization check
  if (user.role === 'seller' && String(product.seller) !== String(user._id)) {
    throw new Error('Not authorized to update this product');
  }

  // Configure upload directory
  const uploadDir = path.join(__dirname, '../../../../../uploads/products', productId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Process files
  const newMedia = await Promise.all(
    files.map(file => {
      // Generate proper filename
      const ext = path.extname(file.originalname);
      const filename = `media-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);

      // Move and validate file
      try {
        fs.renameSync(file.path, filePath);
        if (fs.statSync(filePath).size === 0) {
          fs.unlinkSync(filePath); // Remove empty file
          throw new Error('Uploaded file is empty');
        }
      } catch (err) {
        throw new Error(`File processing failed: ${err.message}`);
      }

      return {
        url: `http://localhost:3000/uploads/products/${productId}/${filename}`,
        resourceType: file.mimetype.startsWith('video') ? 'video' : 'image',
        filename,
        path: filePath,
        mimetype: file.mimetype,
        size: file.size
      };
    })
  );

  // Update product
  product.images.push(...newMedia.filter(m => m.resourceType === 'image'));
  product.videos.push(...newMedia.filter(m => m.resourceType === 'video'));
  product.lastUpdatedBy = user._id;

  await product.save();

  return {
    productId: product._id,
    newMedia
  };
}

module.exports = uploadProductMedia;

// Alternative using Cloudinary
/*const { uploadToCloudinary } = require('../../../../services/cloudinary');

async function uploadProductMedia(Product, productId, files, user) {
  console.log('Uploading product media:', { productId, files, user });
   if (!files || files.length === 0) {
     throw new Error('No files uploaded');
   }

   const product = await Product.findById(productId);
   if (!product) {
     throw new Error('Product not found');
   }

   // Check ownership (sellers can only update their own products)
   if (user.role === 'seller' && String(product.seller) !== String(user._id)) {
     throw new Error('Not authorized to update this product', 403);
   }

   // Upload files to cloud storage
   const uploadResults = await Promise.all(
     files.map(file => 
       uploadToCloudinary(file.path, {
         folder: `products/${productId}`,
         resource_type: file.mimetype.startsWith('video') ? 'video' : 'image'
       })
     )
   );

   // Add media to product
   const newMedia = uploadResults.map(result => ({
     url: result.secure_url,
     resourceType: result.resource_type,
     publicId: result.public_id,
     width: result.width,
     height: result.height,
     format: result.format
   }));

   product.images.push(...newMedia.filter(m => m.resourceType === 'image'));
   product.videos.push(...newMedia.filter(m => m.resourceType === 'video'));
   product.lastUpdatedBy = user._id;
   
   await product.save();

    return {
      productId: product._id,
      newMedia,
    };
}

module.exports = uploadProductMedia;
*/