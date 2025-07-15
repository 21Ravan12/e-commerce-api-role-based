const { encrypt } = require('../../../../core/utilities/crypto');

async function updateSensitiveUser(User, userId, updateData) {
  // Input validation
  if (!userId) throw new Error('userId is required');

  const user = await User.findById(userId)
    .select('+encryptedData +emailHash +phoneHash +auth.mfa');
  if (!user) throw new Error('User not found');

  // Handle updates
  if (updateData.email) {
    user.encryptedData = user.encryptedData || {};
    user.encryptedData.email = updateData.email;
    user.emailHash = updateData.emailHash;
  }

  if (updateData.firstName) {
    user.encryptedData = user.encryptedData || {};
    user.encryptedData.firstName = await encrypt(updateData.firstName);
  }

  if (updateData.lastName) {
    user.encryptedData = user.encryptedData || {};
    user.encryptedData.lastName = await encrypt(updateData.lastName);
  }

  if (updateData.phone) {
    user.encryptedData = user.encryptedData || {};
    user.encryptedData.phone = updateData.phone;
    user.phoneHash = updateData.phoneHash;
  }

  if (updateData.dateOfBirth) {
    user.encryptedData = user.encryptedData || {};
    user.encryptedData.dateOfBirth = await encrypt(updateData.dateOfBirth);
  }
 
  // Handle two-factor updates
  if (updateData.twoFactor) {
    user.auth.twoFactor = user.auth.twoFactor || {};
    if (updateData.twoFactor.secret) {
      user.auth.twoFactor.secret = await encrypt(updateData.twoFactor.secret);
    }
    if (typeof updateData.twoFactor.enabled !== 'undefined') {
      user.auth.twoFactor.enabled = updateData.twoFactor.enabled;
    }
  }

  if (updateData.auth?.mfa) {
    user.auth = user.auth || {};
    user.auth.mfa = updateData.auth.mfa;
  }

  return await user.save();
}

module.exports = updateSensitiveUser;