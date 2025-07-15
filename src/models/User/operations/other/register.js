
async function register(User, userData) {
  try {
    const newUser = new User({
      username: userData.userData.username,
      password: userData.userData.password,
      encryptedData: {
        email: userData.userData.encryptedData.email,
        firstName: userData.userData.encryptedData.firstName,
        lastName: userData.userData.encryptedData.lastName,
        phone: userData.userData.encryptedData.phone,
        dateOfBirth: userData.userData.encryptedData.dateOfBirth
      },
      emailHash: userData.emailHash,
      phoneHash: userData.phoneHash,
      status: 'active',
      preferences: {
        language: userData.userData.preferences?.language || 'en'
      },
      meta: {
        lastLogin: new Date(),
        registration: {
          date: new Date(),
          source: userData.registrationSource || 'web',
          ip: userData.ip,
          userAgent: userData.userAgent
        }
      }
    });

    return await newUser.save();
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

module.exports = register;