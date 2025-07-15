const mongoose = require('mongoose');

/**
 * Updates a user's status in the database
 * @param {Model} User - Mongoose User model
 * @param {string} id - User ID to update
 * @param {string} status - New status ('active', 'suspended', 'banned')
 * @param {Object} [options] - Additional options
 * @param {Object} [options.session] - MongoDB transaction session
 * @returns {Promise<Object>} - Returns the updated user or throws an error
 */
async function updateUserStatus(User, id, status) {

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user ID');
    }

    // Validate status
    const validStatuses = ['active', 'suspended', 'banned'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Update only the status field
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { status }
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
}

module.exports = updateUserStatus;