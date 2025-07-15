// delete product media (images/videos) to local storage or cloud storage(e.g., Cloudinary after line 72).
const fs = require('fs');
const path = require('path');

async function deleteProductMedia(Product, productId, mediaId, user) {
    // Validate input parameters
    if (!mediaId) {
        throw new Error('mediaId parameter is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    // Check ownership
    if (user.role === 'seller' && String(product.seller) !== String(user._id)) {
        throw new Error('Not authorized to update this product', 403);
    }

    let mediaRemoved = false;
    let filePath = null;
    let filename = null;
    let mediaType = null;
    
    // Check images array
    const imageIndex = product.images.findIndex(img => img._id.toString() === mediaId);
    if (imageIndex !== -1) {
        const image = product.images[imageIndex];
        // Extract path from URL for local files
        if (image.url.includes('localhost:3000/uploads')) {
            filePath = path.join(__dirname, '../../../../../', image.url.replace('http://localhost:3000/', ''));
        }
        filename = image.filename || path.basename(image.url);
        product.images.splice(imageIndex, 1);
        mediaRemoved = true;
        mediaType = 'image';
    }

    // Check videos array if not found in images
    if (!mediaRemoved) {
        const videoIndex = product.videos.findIndex(vid => vid._id.toString() === mediaId);
        if (videoIndex !== -1) {
            const video = product.videos[videoIndex];
            if (video.url.includes('localhost:3000/uploads')) {
                filePath = path.join(__dirname, '../../../../../', video.url.replace('http://localhost:3000/', ''));
            }
            filename = video.filename || path.basename(video.url);
            product.videos.splice(videoIndex, 1);
            mediaRemoved = true;
            mediaType = 'video';
        }
    }

    if (!mediaRemoved) {
        throw new Error(`Media with ID ${mediaId} not found in product`);
    }

    // Delete from local storage if file exists
    if (filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                
                // Remove empty product directory if needed
                const productDir = path.dirname(filePath);
                if (fs.existsSync(productDir) && fs.readdirSync(productDir).length === 0) {
                    fs.rmdirSync(productDir);
                }
            }
        } catch (err) {
            console.error('Error deleting file:', err);
            // Continue with database update even if file deletion fails
        }
    }    

    product.lastUpdatedBy = user._id;
    await product.save();

    return {
        success: true,
        productId: product._id,
        mediaType,
        filename,
        timestamp: new Date()
    };
}

module.exports = deleteProductMedia;

// Alternative using Cloudinary
/*async function deleteProductMedia(Product, productId, mediaId, user) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
 
    // Check ownership (sellers can only update their own products)
    if (user.role === 'seller' && String(product.seller) !== String(user._id)) {
      throw new Error('Not authorized to update this product', 403);
    }

    // Find and remove media from both images and videos arrays
    let mediaRemoved = false;
    let publicId = null;
    
    // Check images array
    const imageIndex = product.images.findIndex(img => img._id.toString() === mediaId);
    if (imageIndex !== -1) {
      publicId = product.images[imageIndex].publicId;
      product.images.splice(imageIndex, 1);
      mediaRemoved = true;
    }
    
    // Check videos array if not found in images
    if (!mediaRemoved) {
      const videoIndex = product.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (videoIndex !== -1) {
        publicId = product.videos[videoIndex].publicId;
        product.videos.splice(videoIndex, 1);
        mediaRemoved = true;
      }
    }

    if (!mediaRemoved) {
      throw new Error('Media not found');
    }

    // Delete from cloud storage if publicId exists
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    product.lastUpdatedBy = user._id;
    await product.save();
    
    return {
      productId: product._id,
      mediaId,
      deleted: true,
      timestamp: new Date()
    };
}

module.exports = deleteProductMedia;*/