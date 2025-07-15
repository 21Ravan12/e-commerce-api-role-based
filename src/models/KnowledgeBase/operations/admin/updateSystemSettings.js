const updateSystemSettings = async (settings, adminId) => {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    throw new Error('Invalid settings provided. Must be a non-array object.');
  }

  if (!adminId) {
    throw new Error('Admin ID is required to update system settings');
  }

  const allowedSettings = {
    articleApprovalRequired: 'boolean',
    feedbackModeration: 'boolean',
    maxVersionsToKeep: 'number',
    defaultArticleStatus: 'string',
    searchIndexWeightTitle: 'number',
    searchIndexWeightTags: 'number',
    searchIndexWeightContent: 'number'
  };

  // Additional validation for specific fields
  const validArticleStatuses = ['draft', 'published', 'archived'];
  const numericSettings = ['maxVersionsToKeep', 'searchIndexWeightTitle', 'searchIndexWeightTags', 'searchIndexWeightContent'];

  // Validate settings against allowed settings
  for (const [key, value] of Object.entries(settings)) {
    // Check if setting is allowed
    if (!allowedSettings.hasOwnProperty(key)) {
      throw new Error(`Invalid setting: ${key}`);
    }
    
    // Check type
    if (typeof value !== allowedSettings[key]) {
      throw new Error(`Invalid type for setting ${key}. Expected ${allowedSettings[key]}`);
    }
    
    // Additional validation for specific fields
    if (key === 'defaultArticleStatus' && !validArticleStatuses.includes(value)) {
      throw new Error(`Invalid value for defaultArticleStatus. Must be one of: ${validArticleStatuses.join(', ')}`);
    }
    
    if (numericSettings.includes(key) && value < 0) {
      throw new Error(`Invalid value for ${key}. Must be a positive number`);
    }
    
    if (key === 'maxVersionsToKeep' && !Number.isInteger(value)) {
      throw new Error('maxVersionsToKeep must be an integer');
    }
  }

  // In a real system, you would:
  // 1. Verify adminId has permission to update settings
  // 2. Log the changes with the adminId
  // 3. Update the settings in the database
  // 4. Possibly invalidate caches or notify other systems
  
  // For this example, we'll simulate a successful update
  const updateTimestamp = new Date().toISOString();
  
  return { 
    success: true, 
    updatedSettings: settings,
    updatedBy: adminId,
    updatedAt: updateTimestamp,
    message: 'System settings updated successfully'
  };
};

module.exports = updateSystemSettings;