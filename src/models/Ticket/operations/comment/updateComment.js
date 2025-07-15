const updateComment = async (Ticket, Comment, commentId, userId, updates) => {
    try {
        console.log('Updating comment:', commentId, 'by user:', userId, 'with updates:', updates);
        const comment = await Comment.findOneAndUpdate(
            { 
                _id: commentId, 
                author: userId 
            },
            { 
                content: updates.content,
                updatedAt: new Date() 
            },
            { new: true }
        ).populate('author', 'name email');

        if (!comment) {
            throw new Error('Comment not found or not authorized');
        }

        // Update ticket's updatedAt
        await Ticket.findByIdAndUpdate(comment.ticket, { 
            updatedAt: new Date() 
        });

        return comment;
    } catch (error) {
        throw error;
    }
};

module.exports = updateComment;