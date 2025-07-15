const Order = require('../../../../../models/Order');
const AuditLog = require('../../../../../models/AuditLog/index');
const mongoose = require('mongoose');
const { getAdminOrdersSchema, updateAdminOrderSchema } = require('../schemas/ordersSchema');

class OrderController {

  async getAdminOrders(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'get_admin_orders',
        targetModel: 'Order',
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            filters: {
                status: req.query.status,
                customerId: req.query.customerId,
                dateRange: {
                    from: req.query.dateFrom,
                    to: req.query.dateTo
                },
                totalRange: {
                    min: req.query.minTotal,
                    max: req.query.maxTotal
                }
            },
            pagination: {
                page: req.query.page,
                limit: req.query.limit
            },
            sort: {
                by: req.query.sortBy,
                order: req.query.sortOrder
            }
        }
    });

    try {

        const { 
            page = 1, 
            limit = 10, 
            status, 
            customerId,
            dateFrom,
            dateTo,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minTotal,
            maxTotal
        } = req.query;

        // Validate query parameters
        const { error } = getAdminOrdersSchema.validate(req.query);
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            await complete({
                status: 'failed',
                details: {
                    error: 'Validation failed',
                    validationErrors: errors
                }
            });
            return res.status(400).json({ errors });
        }

        // Build query
        const query = {};
        
        // Status filter
        if (status) {
            query.status = status;
        }
        
        // Customer filter
        if (customerId) {
            if (!mongoose.Types.ObjectId.isValid(customerId)) {
                await complete({
                    status: 'failed',
                    details: {
                        error: 'Invalid customer ID',
                        validationError: true
                    }
                });
                return res.status(400).json({ error: 'Invalid customer ID' });
            }
            query.idCustomer = customerId;
        }
        
        // Date range filter
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }
        
        // Total amount range filter
        if (minTotal || maxTotal) {
            query.total = {};
            if (minTotal) query.total.$gte = Number(minTotal);
            if (maxTotal) query.total.$lte = Number(maxTotal);
        }

        // Use fetchAdminOrders for database operations
        const { orders, total, page: currentPage, pages } = await Order.fetchAdminOrders(
            query.idCustomer, 
            page, 
            limit,
            query,
            sortBy,
            sortOrder
        );

        // Format response with additional admin fields
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.total,
            estimatedDelivery: order.estimatedDelivery,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            customer: order.idCustomer ? {
                _id: order.idCustomer._id,
                name: `${order.idCustomer.firstName} ${order.idCustomer.lastName}`,
                email: order.idCustomer.email
            } : null,
            items: order.items.map(item => ({
                productId: item.idProduct,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
                subtotal: item.subtotal
            })),
            shippingAddress: order.shippingAddress,
            shippingMethod: order.shippingMethod,
            shippingCost: order.shippingCost,
            tax: order.tax,
            notes: order.notes || null,  // Admin-only field
            internalFlags: order.internalFlags || []  // Admin-only field
        }));

        // Complete the log with success details
        await complete({
            status: 'success',
            details: {
                resultCount: orders.length,
                totalOrders: total,
                finalPagination: {
                    page: currentPage,
                    limit: limit,
                    totalPages: pages
                },
                appliedFilters: {
                    status,
                    customerId,
                    dateFrom,
                    dateTo,
                    minTotal,
                    maxTotal
                },
                sort: {
                    by: sortBy,
                    order: sortOrder
                }
            }
        });

        res.status(200).json({
            orders: formattedOrders,
            count: orders.length,
            total: total,
            page: currentPage,
            pages: pages,
            filters: {
                status,
                customerId,
                dateFrom,
                dateTo,
                minTotal,
                maxTotal
            }
        });
    } catch (error) {
        // Complete the log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                queryParams: req.query
            }
        });

        console.error(`[Admin] Error fetching orders: ${error.message}`);
        res.status(500).json({ 
            error: 'Failed to fetch orders',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  async updateOrderStatus(req, res) {
    // Create a timed log entry at the start
    const { logEntry, complete } = await AuditLog.createTimedAdminLog({
        action: 'update_order_status',
        targetModel: 'Order',
        targetId: req.params.id,
        performedBy: req.user._id,
        performedByEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        source: 'web',
        details: {
            requestedOrderId: req.params.id,
            updateData: req.body,
            forceUpdateRequested: req.body.forceUpdate || false
        }
    });

    try {
        const orderId = req.params.id;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            await complete({
                status: 'failed',
                details: {
                    error: 'Invalid order ID',
                    validationError: true
                }
            });
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const { error } = updateAdminOrderSchema.validate(req.body);
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            await complete({
                status: 'failed',
                details: {
                    error: 'Validation failed',
                    validationErrors: errors
                }
            });

            return res.status(400).json({ errors });
        }

        // Use the model method for updating order status
        const result = await Order.adminUpdateOrderStatus({
            orderId,
            updateData: req.body,
            adminId,
            forceUpdate: req.body.forceUpdate || false
        });

        if (!result || result.error) {
            await complete({
                status: 'failed',
                details: {
                    error: result?.error || 'Order not found or update failed',
                    notFound: result?.notFound || false
                }
            });
            return res.status(result?.statusCode || 404).json({ error: result?.error || 'Order not found or update failed' });
        }

        // Complete the admin log with success details
        await complete({
            status: 'success',
            details: {
                oldValues: result.oldValues,
                newValues: result.newValues,
                forceUpdateUsed: req.body.forceUpdate || false,
                refundProcessed: result.refundProcessed,
                refundDetails: result.refundDetails
            }
        });

        // Create the specialized audit log (preserving existing functionality)
        await AuditLog.createLog({
            event: 'ADMIN_ORDER_UPDATE',
            user: adminId,
            action: 'update',
            source: 'web',
            status: 'success',
            ip: req.ip,
            userAgent: req.get('User-Agent')?.slice(0, 200) || '',
            metadata: {
                orderId: result.updatedOrder._id,
                oldValues: result.oldValues,
                newValues: result.newValues,
                forceUpdateUsed: req.body.forceUpdate || false
            }
        });

        // Format response
        const formattedOrder = {
            _id: result.updatedOrder._id,
            orderNumber: result.updatedOrder.orderNumber,
            status: result.updatedOrder.status,
            paymentStatus: result.updatedOrder.paymentStatus,
            total: result.updatedOrder.total,
            estimatedDelivery: result.updatedOrder.estimatedDelivery,
            paymentMethod: result.updatedOrder.paymentMethod,
            createdAt: result.updatedOrder.createdAt,
            updatedAt: result.updatedOrder.updatedAt,
            updatedBy: result.updatedOrder.updatedBy,
            adminNotes: result.updatedOrder.adminNotes,
            items: result.updatedOrder.items.map(item => ({
                productId: item.idProduct,
                quantity: item.quantity,
                price: item.priceAtPurchase,
                subtotal: item.subtotal
            })),
            shippingAddress: result.updatedOrder.shippingAddress,
            shippingMethod: result.updatedOrder.shippingMethod,
            shippingCost: result.updatedOrder.shippingCost,
            tax: result.updatedOrder.tax
        };

        res.status(200).json({
            message: 'Order updated successfully by admin',
            order: formattedOrder,
            refundProcessed: result.refundProcessed
        });

    } catch (error) {
        // Complete the admin log with error details
        await complete({
            status: 'failed',
            details: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                orderId: req.params.id,
                updateData: req.body
            }
        });

        // Create the specialized audit log for failure (preserving existing functionality)
        await AuditLog.createLog({
            event: 'ADMIN_ORDER_UPDATE',
            user: req.user?._id,
            action: 'update',
            source: 'web',
            status: 'failure',
            ip: req.ip,
            userAgent: req.get('User-Agent')?.slice(0, 200) || '',
            metadata: {
                error: error.message,
                orderId: req.params.id,
                updateData: req.body
            }
        });

        console.error(`[Admin] Error updating order: ${error.message}`);
        res.status(500).json({ 
            error: 'Failed to update order',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

}

module.exports = new OrderController();