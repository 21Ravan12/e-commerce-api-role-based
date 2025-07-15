const deleteComment = async (Ticket, Comment, commentId, userId) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: commentId,
            author: userId
        });

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

module.exports = deleteComment;