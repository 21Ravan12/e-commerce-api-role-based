const updateTicket = async (Ticket, ticketId, userId, updates) => {
    try {
        // Validate inputs
        if (!ticketId || !userId) {
            throw new Error('Ticket ID and User ID are required');
        }

        // Limit the size of updates
        const MAX_UPDATE_SIZE = 5000; // 5KB
        if (!updates || typeof updates !== 'object') {
            throw new Error('Updates payload is required and must be an object');
        }
        const updateStr = JSON.stringify(updates);
        if (updateStr.length > MAX_UPDATE_SIZE) {
            throw new Error(`Update payload too large (max ${MAX_UPDATE_SIZE} bytes)`);
        }

        // Define allowed fields that can be updated (adjust according to your schema)
        const allowedFields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate'];
        const filteredUpdates = {};
        
        // Filter updates to only include allowed fields
        for (const key in updates) {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        }

        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                ...filteredUpdates,
                updatedAt: new Date(),
                $push: {
                    activityLog: {
                        action: 'updated',
                        by: userId,
                        at: new Date(),
                        details: updateStr.length > 1000 ? 
                            'Large update payload' : 
                            updateStr
                    }
                }
            },
            { new: true, runValidators: true } // Added runValidators to enforce schema validation
        )
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email'); // Also populate assignedTo if needed

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        return ticket;
    } catch (error) {
        // Log the error for debugging
        console.error(`Error updating ticket ${ticketId}:`, error.message);
        throw error; // Re-throw for the caller to handle
    }
};

module.exports = updateTicket;