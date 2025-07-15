const ReturnRequest = require('../../../models/ReturnRequest');
const AuditLog = require('../../../models/AuditLog/index');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const { returnRequestSchema, returnRequestCustomerUpdateSchema, returnRequestAdminUpdateSchema } = require('../schemas/returnRequestSchema');

class ReturnRequestController {

  async getReturnRequest(req, res) {
    const transactionId = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
    const startTime = process.hrtime();
  
    try {
      logger.info(`[${transactionId}] Get return request initiated from IP: ${req.ip}`);
  
      // Validate return request ID
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        const err = new Error('Invalid return request ID format');
        err.statusCode = 400;
        throw err;
      }
      
      const returnRequest = await ReturnRequest.getReturnRequest({id: req.params.id, userId: req.params.userId, userRole: req.user.roles});
  
      if (!returnRequest) {
        const err = new Error('Return request not found');
        err.statusCode = 404;
        throw err;
      }
  
      // Prepare response with HATEOAS links
      const response = {
        success: true,
        data: {
          returnRequest: {
            id: returnRequest._id,
            status: returnRequest.status,
            reason: returnRequest.reason,
            returnType: returnRequest.returnType,
            refundAmount: returnRequest.refundAmount,
            createdAt: returnRequest.createdAt,
            customer: {
              id: returnRequest.customerId._id,
              username: returnRequest.customerId.username,
              email: returnRequest.customerId.email
            },
            order: {
              id: returnRequest.orderId._id,
              totalAmount: returnRequest.orderId.totalAmount,
              status: returnRequest.orderId.status
            },
            ...(returnRequest.exchangeProductId && {
              exchangeProduct: {
                id: returnRequest.exchangeProductId._id,
                name: returnRequest.exchangeProductId.name,
                price: returnRequest.exchangeProductId.price
              }
            })
          },
          _links: {
            self: { href: `/api/v1/returns/${returnRequest._id}` },
            update: { href: `/api/v1/returns/${returnRequest._id}`, method: 'PATCH' },
            cancel: { href: `/api/v1/returns/${returnRequest._id}/cancel`, method: 'DELETE' }
          }
        }
      };
  
      // Security headers
      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .set('Content-Security-Policy', "default-src 'self'")
        .set('X-Request-ID', transactionId)
        .status(200)
        .json(response);
  
      // Log successful completion
      const elapsedTime = process.hrtime(startTime);
      logger.info(`[${transactionId}] Return request retrieved in ${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`, {
        returnRequestId: returnRequest._id,
        processingTime: `${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`
      });
  
    } catch (error) {
      // Enhanced error logging
      logger.error(`[${transactionId}] Get return request failed`, {
        error: error.message,
        stack: error.stack,
        userId: req.user?._id,
        returnRequestId: req.params.id
      });
  
      // Standardized error response
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        success: false,
        error: error.message,
        ...(error.details && { details: error.details }),
        transactionId,
        _links: {
          documentation: { href: '/api-docs/returns#get-return-request' }
        }
      };
      
      res.status(statusCode).json(errorResponse);
    }
  }

  async getReturnRequests(req, res) {
  const transactionId = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
  const startTime = process.hrtime();

  try {
    logger.info(`[${transactionId}] Get return requests initiated from IP: ${req.ip}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build query conditionally
    const query = {};

    if (req.query.customerId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.customerId)) {
        const err = new Error('Invalid customerId filter value');
        err.statusCode = 400;
        throw err;
      }
      query.customerId = req.query.customerId;
      console.log(query.customerId); 
    }

    // Status filter
    if (req.query.status) {
      const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'refunded'];
      if (!validStatuses.includes(req.query.status)) {
        const err = new Error('Invalid status filter value');
        err.statusCode = 400;
        throw err;
      }
      query.status = req.query.status;
    }

    // Return type filter
    if (req.query.returnType) {
      const validTypes = ['refund', 'exchange', 'store_credit'];
      if (!validTypes.includes(req.query.returnType)) {
        const err = new Error('Invalid returnType filter value');
        err.statusCode = 400;
        throw err;
      }
      query.returnType = req.query.returnType;
    }

    // Order ID filter
    if (req.query.orderId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.orderId)) {
        const err = new Error('Invalid orderId filter value');
        err.statusCode = 400;
        throw err;
      }
      query.orderId = req.query.orderId;
    }

    // Sorting
    const sort = {};
    if (req.query.sort) {
      req.query.sort.split(',').forEach(field => {
        if (field.startsWith('-')) sort[field.substring(1)] = -1;
        else sort[field] = 1;
      });
    } else {
      sort.createdAt = -1;
    }

    // Fetch data
    const { returnRequests, total } = await ReturnRequest.getReturnRequests({
      query, // pass built query
      sort,
      page,
      limit
    });

    // Construct response...
    // [Same as your current logic, unchanged]
    const response = {
      success: true,
      data: {
        returnRequests: returnRequests.map(rr => ({
          id: rr._id,
          reason: rr.reason,
          description: rr.description,
          status: rr.status,
          returnType: rr.returnType,
          refundAmount: rr.refundAmount,
          returnShippingMethod: rr.returnShippingMethod,
          returnLabelProvided: rr.returnLabelProvided,
          createdAt: rr.createdAt,
          updatedAt: rr.updatedAt,
          customer: {
            id: rr.customerId?._id || rr.customerId
          },
          order: {
            id: rr.orderId?._id || rr.orderId
          },
          ...(rr.exchangeProductId && {
            exchangeProduct: {
              id: rr.exchangeProductId?._id || rr.exchangeProductId,
              ...(rr.exchangeProductId?.name && { name: rr.exchangeProductId.name }),
              ...(rr.exchangeProductId?.price && { price: rr.exchangeProductId.price })
            }
          })
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        _links: {
          self: { href: `/api/v1/returns?page=${page}&limit=${limit}` },
          first: { href: `/api/v1/returns?page=1&limit=${limit}` },
          last: { href: `/api/v1/returns?page=${Math.ceil(total / limit)}&limit=${limit}` },
          ...(page > 1 && {
            prev: { href: `/api/v1/returns?page=${page - 1}&limit=${limit}` }
          }),
          ...(page < Math.ceil(total / limit) && {
            next: { href: `/api/v1/returns?page=${page + 1}&limit=${limit}` }
          })
        }
      }
    };

    res
      .set('X-Content-Type-Options', 'nosniff')
      .set('X-Frame-Options', 'DENY')
      .set('Content-Security-Policy', "default-src 'self'")
      .set('X-Request-ID', transactionId)
      .status(200)
      .json(response);

    const elapsedTime = process.hrtime(startTime);
    logger.info(`[${transactionId}] Return requests retrieved in ${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`, {
      count: returnRequests.length,
      processingTime: `${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`
    });

  } catch (error) {
    logger.error(`[${transactionId}] Get return requests failed`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      queryParams: req.query
    });

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      ...(error.details && { details: error.details }),
      transactionId,
      _links: {
        documentation: { href: '/api-docs/returns#list-return-requests' }
      }
    });
  }
  }
  
  async reviewAndUpdateReturnRequest(req, res) {
    const transactionId = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
    const startTime = process.hrtime();
  
    try {
      logger.info(`[${transactionId}] Admin update return request initiated from IP: ${req.ip}`);
  
      // Content type validation
      if (!req.is('application/json')) {
        const err = new Error('Content-Type must be application/json');
        err.statusCode = 415;
        throw err;
      }
  
      // Validate return request ID
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        const err = new Error('Invalid return request ID format');
        err.statusCode = 400;
        throw err;
      }
  
      // Admin can update more fields
      const { error, value } = returnRequestAdminUpdateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false,
        errors: {
          wrap: {
            label: false
          }
        }
      });
  
      if (error) {
        const errorDetails = error.details.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        const validationError = new Error('Validation failed');
        validationError.details = errorDetails;
        validationError.statusCode = 422;
        throw validationError;
      }
  
      // Update return request
      const updatedReturnRequest = await ReturnRequest.updateAdminReturnRequest(req.params.id, value);
  
      // Create audit log
      await AuditLog.createLog({
        event: 'RETURN_REQUEST_ADMIN_UPDATE',
        action: 'update',
        entityType: 'return_request',
        entityId: updatedReturnRequest._id,
        user: req.user._id,
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        metadata: {
          newValues: {
            status: updatedReturnRequest.status,
            refundAmount: updatedReturnRequest.refundAmount,
            description: updatedReturnRequest.description,
            returnShippingMethod: updatedReturnRequest.returnShippingMethod,
            adminNotes: updatedReturnRequest.adminNotes
          },
          changedFields: Object.keys(value),
          transactionId,
          updateType: 'admin'
        }
      });
  
      // Prepare response with HATEOAS links
      const response = {
        success: true,
        message: "Return request updated successfully by admin",
        data: {
          returnRequest: {
            id: updatedReturnRequest._id,
            status: updatedReturnRequest.status,
            returnType: updatedReturnRequest.returnType,
            refundAmount: updatedReturnRequest.refundAmount,
            adminNotes: updatedReturnRequest.adminNotes
          },
          _links: {
            self: { href: `/api/v1/admin/returns/${updatedReturnRequest._id}` },
            customer: { href: `/api/v1/returns/${updatedReturnRequest._id}` }
          }
        }
      };
  
      // Security headers
      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .set('Content-Security-Policy', "default-src 'self'")
        .set('X-Request-ID', transactionId)
        .status(200)
        .json(response);
  
      // Log successful completion
      const elapsedTime = process.hrtime(startTime);
      logger.info(`[${transactionId}] Admin return request updated in ${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`, {
        returnRequestId: updatedReturnRequest._id,
        processingTime: `${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`,
        adminId: req.user._id
      });
  
    } catch (error) {
      // Enhanced error logging
      logger.error(`[${transactionId}] Admin return request update failed`, {
        error: error.message,
        stack: error.stack,
        adminId: req.user?._id,
        returnRequestId: req.params.id,
        inputData: req.body
      });
  
      // Standardized error response
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        success: false,
        error: error.message,
        ...(error.details && { details: error.details }),
        transactionId,
        _links: {
          documentation: { href: '/api-docs/admin/returns#update-return-request' }
        }
      };
      
      res.status(statusCode).json(errorResponse);
    }
  }

  async archiveReturnRequest(req, res) {
    const transactionId = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
    const startTime = process.hrtime();
  
    try {
      logger.info(`[${transactionId}] Delete return request initiated from IP: ${req.ip}`);
  
      // Call static method to perform soft delete
      const { archivedRequest, data } = await ReturnRequest.deleteReturnRequest(
        req.params.id,
        req.user,
      );
     
      // Create audit log
      await AuditLog.createLog({
        event: 'RETURN_REQUEST_ARCHIVED',
        action: 'archive',
        entityType: 'return_request',
        entityId: data.id,
        user: req.user._id,
        source: 'web',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        metadata: {
          transactionId,
          returnType: data.returnType,
          newStatus: data.status,
        }
      });
  
      // Prepare response with HATEOAS links
      const response = {
        success: true,
        message: 'Return request archived successfully',
        data: {
          id: data.id,
          status: data.status,
          archivedAt: data.archivedAt
        }
      };
  
      // Security headers
      res
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-Frame-Options', 'DENY')
        .set('Content-Security-Policy', "default-src 'self'")
        .set('X-Request-ID', transactionId)
        .status(200)
        .json(response);
  
      // Log successful completion
      const elapsedTime = process.hrtime(startTime);
      logger.info(`[${transactionId}] Return request archived in ${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`, {
        returnRequestId: data.id,
        processingTime: `${elapsedTime[0] * 1000 + elapsedTime[1] / 1e6}ms`,
        userId: req.user._id
      });
  
    } catch (error) {
      // Enhanced error logging
      logger.error(`[${transactionId}] Return request archive failed`, {
        error: error.message,
        stack: error.stack,
        userId: req.user?._id,
        returnRequestId: req.params.id
      });
  
      // Standardized error response
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        success: false,
        error: error.message,
        ...(error.details && { details: error.details }),
        transactionId,
        _links: {
          documentation: { href: '/api-docs/returns#delete-return-request' }
        }
      };
      
      res.status(statusCode).json(errorResponse);
    }
  }
}

module.exports = new ReturnRequestController();