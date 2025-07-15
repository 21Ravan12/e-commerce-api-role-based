const mongoose = require('mongoose');

async function deleteReturnRequest(ReturnRequest, id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { 
      message: 'Invalid return request ID format', 
      statusCode: 400 
    };
  }

  const returnRequest = await ReturnRequest.findById(id);
  
  if (!returnRequest) {
    throw { 
      message: 'Return request not found', 
      statusCode: 404 
    };
  }

  if (returnRequest.status === 'archived') {
    throw { 
      message: 'Return request already archived', 
      statusCode: 410 
    };
  }
  if (!['admin', 'moderator'].includes(user.roles) && !returnRequest.customerId._id.equals(user._id)) {
    throw { 
      message: 'Not authorized to update this return request', 
      statusCode: 403 
    };
  }

  if (returnRequest.status !== 'pending') {
    throw { 
      message: 'Only pending return requests can be archived', 
      statusCode: 403 
    };
  }

  returnRequest.status = 'archived';
  const archivedRequest = await returnRequest.save();

  return {
    success: true,
    message: 'Return request archived successfully',
    data: {
      id: archivedRequest._id,
      status: archivedRequest.status,
      archivedAt: archivedRequest.archivedAt
    }
  };
}

module.exports = deleteReturnRequest;