const crypto = require('crypto');

async function deleteAccount(User, userId, reason, reqData = {}) {
  if (!userId) throw new Error('userId is required');

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      status: 'deleted',
      username: `deleted-${crypto.randomBytes(4).toString('hex')}`,
      'auth.passwordChangedAt': new Date(),
      $unset: { 'encryptedData': 1, 'emailHash': 1, 'phoneHash': 1 }
    },
    { new: true }
  );

  if (!updatedUser) throw new Error('User not found');

  return {
    success: true,
    userId: updatedUser._id,
    previousStatus: updatedUser.status,
    anonymizedFields: ['encryptedData', 'emailHash', 'phoneHash'],
    metadata: {
      reason,
      statusChange: 'active → deleted',
      anonymized: true,
      ip: reqData.ip,
      userAgent: reqData.userAgent,
      deviceFingerprint: reqData.deviceFingerprint,
      location: reqData.geoLocation
    }
  };
}

module.exports = deleteAccount;