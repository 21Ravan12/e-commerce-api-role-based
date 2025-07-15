const {User} = require('../../../User');
async function updateUserWithNewOrder(userId, orderId) {
    return User.updateOne(
      { _id: userId },
      {
        $push: { 'commerce.orders': orderId },
        $set: { 'commerce.cart.items': [] }
      }
    );
}

module.exports = updateUserWithNewOrder;