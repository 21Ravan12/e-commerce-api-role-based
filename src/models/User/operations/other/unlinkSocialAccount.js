async function unlinkSocialAccount(User, userId, provider, reqData = {}) {
  // Input validation
  if (!userId || !provider) {
    throw new Error('userId and provider are required');
  }

  const validProviders = ['google', 'facebook', 'twitter', 'github'];
  if (!validProviders.includes(provider)) {
    throw new Error('Invalid provider');
  }

  // Update the user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { [`social.${provider}Id`]: null },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return {
    success: true,
    userId: updatedUser._id,
    provider,
    metadata: {
      statusChange: 'linked → unlinked',
      ip: reqData.ip,
      userAgent: reqData.userAgent,
      deviceFingerprint: reqData.deviceFingerprint,
      location: reqData.geoLocation
    }
  };
}

module.exports = unlinkSocialAccount;