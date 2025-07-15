const { Category } = require('../../../models/Product');
const {Product} = require('../../../models/Product');
const { User } = require('../../../models/User');

async function createProductBasedPromotionCode(PromotionCode, codeData) {
  const uppercaseCode = codeData.promotionCode.toUpperCase();

  // Duplicate code check
  const existingCode = await PromotionCode.findOne({ promotionCode: uppercaseCode });
  if (existingCode) {
    throw new Error('Promotion code already exists');
  }

  // Validate applicable products
  if (!codeData.applicableProducts || codeData.applicableProducts.length === 0) {
    throw new Error('At least one applicable product is required for a product-based promotion');
  }

  const validApplicableProducts = await Product.countDocuments({
    _id: { $in: codeData.applicableProducts }
  });

  if (validApplicableProducts !== codeData.applicableProducts.length) {
    throw new Error('One or more applicable products are invalid');
  }

  // Validate excluded products
  if (codeData.excludedProducts?.length > 0) {
    const validExcluded = await Product.countDocuments({
      _id: { $in: codeData.excludedProducts }
    });
    if (validExcluded !== codeData.excludedProducts.length) {
      throw new Error('One or more excluded products are invalid');
    }
  }

  // Validate eligible customers
  if (codeData.customerEligibility === 'specific_customers') {
    if (!codeData.eligibleCustomers || codeData.eligibleCustomers.length === 0) {
      throw new Error('Eligible customers must be provided for specific_customers type');
    }

    const validCustomers = await User.countDocuments({
      _id: { $in: codeData.eligibleCustomers },
    });

    if (validCustomers !== codeData.eligibleCustomers.length) {
      throw new Error('One or more eligible customers are invalid');
    }
  }

  const newPromotionCode = new PromotionCode({
    ...codeData,
  });

  return newPromotionCode.save();
}

module.exports = createProductBasedPromotionCode;
