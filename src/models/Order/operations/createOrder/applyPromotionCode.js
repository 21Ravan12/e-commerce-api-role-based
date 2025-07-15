const logger = require('../../../../services/logger');
const { PromotionCode } = require('../../../PromotionCode');

async function applyPromotionCode(Order, promotionCode, userId, items, subtotal, shippingCost) {
    if (!promotionCode) {
      return {
        discount: 0,
        promotionDetails: null,
        finalShippingCost: shippingCost,
        error: null
      };
    }

    // Validate promotion code
    const promotion = await PromotionCode.findOne({
      code: promotionCode,
      active: true,
      $or: [
        { validFrom: { $lte: new Date() } },
        { validFrom: { $exists: false } }
      ],
      $or: [
        { validUntil: { $gte: new Date() } },
        { validUntil: { $exists: false } }
      ]
    });

    if (!promotion) {
      return {
        error: 'Invalid or expired promotion code'
      };
    }

    // Check if user has already used this promotion
    const hasUsed = await Order.exists({
      idCustomer: userId,
      'promotion.code': promotionCode,
      status: { $nin: ['cancelled', 'failed'] }
    });

    if (hasUsed && promotion.oneTimeUse) {
      return {
        error: 'This promotion code has already been used'
      };
    }

    // Calculate discount based on promotion type
    let discount = 0;
    let finalShippingCost = shippingCost;
    const applicableItems = items.filter(item => 
      !promotion.applicableProducts || 
      promotion.applicableProducts.includes(item.product._id)
    );

    if (promotion.discountType === 'percentage') {
      const applicableSubtotal = applicableItems.reduce(
        (sum, item) => sum + (item.priceAtPurchase * item.quantity),
        0
      );
      discount = applicableSubtotal * (promotion.discountValue / 100);
    } else if (promotion.discountType === 'fixed') {
      discount = Math.min(promotion.discountValue, subtotal);
    } else if (promotion.discountType === 'freeShipping') {
      finalShippingCost = 0;
    }

    return {
      discount,
      promotionDetails: {
        code: promotion.code,
        name: promotion.name,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        applicableProducts: promotion.applicableProducts
      },
      finalShippingCost,
      error: null
    };
}


module.exports = applyPromotionCode;