async function linkSocialAccount(User, userId, provider, providerId, reqData = {}) {
  const validProviders = ['google', 'facebook', 'twitter', 'github'];
  if (!validProviders.includes(provider)) {
    throw new Error('Invalid provider');
  }

  const existingUser = await User.findOne({ [`social.${provider}Id`]: providerId });
  if (existingUser && existingUser._id.toString() !== userId) {
    throw new Error('This social account is already linked to another user');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { [`social.${provider}Id`]: providerId },
    { new: true }
  );

  if (!updatedUser) throw new Error('User not found');

  return {
    success: true,
    userId: updatedUser._id,
    provider,
    metadata: {
      statusChange: 'unlinked → linked',
      ip: reqData.ip,
      userAgent: reqData.userAgent,
      deviceFingerprint: reqData.deviceFingerprint,
      location: reqData.geoLocation
    }
  };
}

module.exports = linkSocialAccount;