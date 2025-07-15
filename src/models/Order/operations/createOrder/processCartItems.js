const logger = require('../../../../services/logger');
const Campaign = require('../../../Campaign');
const { Product } = require('../../../Product');

async function processCartItems(getCartProductsById, cartItems) {
    if (!cartItems || cartItems.length === 0) {
        throw new Error('Cannot process empty cart');
    }

    let subtotal = 0;
    const orderItems = [];
    const outOfStockItems = [];
    
    try {
        // 1. Load required data in parallel
        const [activeCampaigns, products] = await Promise.all([
            Campaign.getActiveCampaigns(),
            getCartProductsById(cartItems.map(item => item.product))
        ]);

        logger.info(`Processing ${cartItems.length} cart items with ${activeCampaigns.length} active campaigns`);

        // 2. Create product map for efficient lookups
        const productMap = new Map();
        products.forEach(product => {
            productMap.set(product._id.toString(), product);
        });

        // 3. Process each cart item
        for (const cartItem of cartItems) {
            const productId = cartItem.product.toString();
            const product = productMap.get(productId);
            
            // 3.1 Validate product availability
            if (!product) {
                outOfStockItems.push({
                    productId: cartItem.product,
                    reason: 'Product no longer available'
                });
                continue;
            }

            if (product.stockQuantity < cartItem.quantity) {
                outOfStockItems.push({
                    productId: product._id,
                    name: product.name,
                    requested: cartItem.quantity,
                    available: product.stockQuantity,
                    reason: 'Insufficient stock'
                });
                continue;
            }

            // 3.2 Initialize pricing variables
            let finalPrice = product.price;
            let finalQuantity = cartItem.quantity;
            const appliedCampaigns = [];

            // 3.3 Apply relevant campaign discounts
            for (const campaign of activeCampaigns) {
                try {
                    // Check if product qualifies for this campaign
                    const isCategoryMatch = campaign.validCategories?.some(catId => 
                        product.categories?.includes(catId.toString())
                    ) || false;
                    
                    if (isCategoryMatch && !campaign.excludedProducts?.includes(product._id.toString())) {
                        logger.debug(`Applying campaign ${campaign.campaignName} to product ${product.name}`);
                        
                        const originalPrice = finalPrice;
                        
                        // Apply campaign logic
                        switch (campaign.campaignType) {
                            case 'fixed':
                                finalPrice = Math.max(0, finalPrice - campaign.campaignAmount);
                                break;
                            case 'percentage':
                                finalPrice = finalPrice * (1 - campaign.campaignAmount / 100);
                                break;
                            case 'buy_x_get_y':
                                if (finalQuantity >= campaign.buyX) {
                                    const freeItems = Math.floor(finalQuantity / campaign.buyX) * campaign.getY;
                                    finalQuantity = finalQuantity - freeItems;
                                }
                                break;
                            default:
                                logger.warn(`Unknown campaign type: ${campaign.campaignType}`);
                        }

                        // Track campaigns that affected price or quantity
                        if (originalPrice !== finalPrice || campaign.campaignType === 'buy_x_get_y') {
                            appliedCampaigns.push({
                                campaignId: campaign._id,
                                campaignName: campaign.campaignName,
                                discountType: campaign.campaignType,
                                discountValue: campaign.campaignAmount
                            });
                        }
                    }
                } catch (campaignError) {
                    logger.error(`Error applying campaign ${campaign._id} to product ${product._id}:`, campaignError);
                }
            }

            // 3.4 Validate final price
            if (isNaN(finalPrice)) {
                finalPrice = product.price; // Fallback to original price
            }

            // 3.5 Calculate item subtotal and build order item
            const itemSubtotal = finalPrice * finalQuantity;
            subtotal += itemSubtotal;

            orderItems.push({
                idProduct: product._id,
                productName: product.name,
                quantity: cartItem.quantity,
                effectiveQuantity: finalQuantity,
                originalPrice: product.price,
                priceAtPurchase: finalPrice,
                subtotal: itemSubtotal,
                appliedCampaigns,
                discountPercentage: ((product.price - finalPrice) / product.price * 100).toFixed(2)
            });
        }

        // 4. Validate campaign minimum purchase requirements
        const minPurchaseCampaigns = activeCampaigns.filter(c => c.minPurchaseAmount);
        for (const campaign of minPurchaseCampaigns) {
            if (subtotal < campaign.minPurchaseAmount) {
                logger.info(`Subtotal ${subtotal} < minimum ${campaign.minPurchaseAmount} for campaign ${campaign.campaignName}`);
                // TODO: Implement logic to remove discounts if minimum not met
            }
        }

        return {
            orderItems,
            subtotal,
            outOfStockItems
        };

    } catch (error) {
        logger.error('Error processing cart items:', error);
        throw new Error('Failed to process cart items');
    }
}


module.exports = processCartItems;