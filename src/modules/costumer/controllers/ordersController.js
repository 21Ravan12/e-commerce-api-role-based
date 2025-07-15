const Order = require('../../../models/Order');
const PaymentProcessor = require('../../core/services/payment/PaymentProcessor');
const AuditLog = require('../../../models/AuditLog/index');
const User = require('../../../models/User');
const logger = require('../../../services/logger');
const mongoose = require('mongoose');
const { createOrderSchema, getOrdersSchema, cancelOrderSchema } = require('../schemas/ordersSchema');
const { calculateDeliveryDate, calculateShipping } = require('../services/service');

class OrderController {

  async createOrder(req, res) {
    try {
        const userId = req.user._id;
        const { shippingAddress, paymentMethod, shippingMethod, promotionCode } = req.body;

        // Validate request body against schema
        const { error } = createOrderSchema.validate(req.body);
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({ errors });
        }

        // Get user with populated cart
        const cart = await User.getCartItems(userId, { commerce: 1 });

        // Validate cart not empty
        if (!cart?.items || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cannot create order with empty cart' });
        }

        // Process cart items and calculate order details
        const { orderItems, subtotal, outOfStockItems } = await Order.processCartItems(cart.items);
        
        if (outOfStockItems.length > 0) {
            await AuditLog.createLog({
                event: 'ORDER_CREATE',
                user: userId,
                action: 'create',
                source: 'api',
                status: 'failure',
                ip: req.ip,
                userAgent: req.get('User-Agent')?.slice(0, 200) || '',
                metadata: {
                    error: 'Out of stock items',
                    outOfStockItems,
                    cartItems: cart.items.map(item => ({
                        productId: item.product?._id,
                        name: item.product?.name,
                        requestedQuantity: item.quantity
                    }))
                }
            });

            return res.status(400).json({
                error: 'Some items are out of stock',
                outOfStockItems
            });
        }

        // Calculate shipping cost
        const shippingCost = await calculateShipping(shippingMethod);
        const deliveryDate = calculateDeliveryDate(new Date(), shippingMethod);

        // Handle promotion code
        const promotionResult = await Order.applyPromotionCode(
            promotionCode,
            userId,
            orderItems,
            subtotal,
            shippingCost
        );

        if (promotionResult.error) {
            return res.status(400).json({ error: promotionResult.error });
        }

        const { discount, promotionDetails, finalShippingCost } = promotionResult;

        // Calculate final totals including tax
        const { tax, total } = await Order.calculateFinalTotals(
            subtotal,
            discount,
            shippingAddress,
            finalShippingCost
        );

        // Create and process the order
        const { order, paymentResult } = await Order.createAndProcessOrder({
            idCustomer: userId,
            items: orderItems,
            paymentMethod,
            shippingAddress,
            shippingMethod,
            discount,
            promotion: promotionDetails,
            estimatedDelivery: deliveryDate,
            subtotal,
            tax,
            shippingCost: finalShippingCost,
            total
        }, paymentMethod);


        // Finalize the order (update user, inventory, etc.)
        await Order.finalizeOrder(
            order._id,
            userId,
            orderItems,
            paymentResult,
            paymentMethod,
            promotionCode
        );

        // Create audit log
        await AuditLog.createLog({
            event: 'ORDER_CREATE',
            user: userId,
            action: 'create',
            source: 'api',
            status: 'success',
            ip: req.ip,
            userAgent: req.get('User-Agent')?.slice(0, 200) || '',
            metadata: {
                orderId: order._id,
                totalAmount: order.total,
                itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
                paymentMethod: order.paymentMethod,
                transactionId: order.transactionId,
                products: order.items.map(item => ({
                    productId: item.idProduct,
                    quantity: item.quantity,
                    price: item.priceAtPurchase
                })),
                campaigns: order.appliedCampaigns
            }
        });
        
        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                estimatedDelivery: order.estimatedDelivery,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                appliedDiscounts: {
                    campaigns: order.appliedCampaigns,
                    promotion: order.promotion
                }
            }
        });
    } catch (error) {
        await AuditLog.createLog({
            event: 'ORDER_CREATE',
            user: req.user?._id,
            action: 'create',
            source: 'api',
            status: 'failure',
            ip: req.ip,
            userAgent: req.get('User-Agent')?.slice(0, 200) || '',
            metadata: {
                error: error.message,
                shippingAddress: req.body.shippingAddress,
                paymentMethod: req.body.paymentMethod
            }
        });

        logger.error(`Error creating order: ${error.message}`, { error });
        res.status(500).json({ error: 'Failed to create order' });
    }
  }

  async getOrders(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, status } = req.query;
  
      // Validate query parameters
      const { error } = getOrdersSchema.validate({ page, limit, status });
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        return res.status(400).json({ errors });
      }

      // Get orders with status filtering at the database level for efficiency
      const ordersData = await Order.getCustomerOrders(userId, page, limit, status);
  
      // Format the orders response
      const formattedOrders = ordersData.orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        status: order.status,
        total: order.total,
        estimatedDelivery: order.estimatedDelivery,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        // Include first product image if available
        previewImage: order.items[0]?.idProduct?.mainImage || null
      }));
  
      await AuditLog.createLog({
        event: 'ORDERS_ACCESS',
        user: userId,
        action: 'read',
        source: 'api',
        status: 'success',
        ip: req.ip,
        userAgent: req.get('User-Agent')?.slice(0, 200) || '',
        metadata: {
          orderCount: formattedOrders.length,
          totalOrders: ordersData.total,
          page,
          limit,
          statusFilter: status || 'all'
        }
      });
  
      res.status(200).json({
        orders: formattedOrders,
        count: formattedOrders.length,
        total: ordersData.total,
        page: ordersData.page,
        pages: ordersData.pages,
        limit: ordersData.limit
      });
  
    } catch (error) {
      await AuditLog.createLog({
        event: 'ORDERS_ACCESS',
        user: req.user?._id,
        action: 'read',
        source: 'api',
        status: 'failure',
        ip: req.ip,
        userAgent: req.get('User-Agent')?.slice(0, 200) || '',
        metadata: {
          error: error.message,
          queryParams: req.query
        }
      });
  
      console.error(`Error fetching orders: ${error.message}`);
      res.status(500).json({
        error: 'Failed to fetch orders',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;
  
      // Use static method for DB access
      const order = await Order.getOrder(orderId, userId);
  
      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found',
          details: 'No order found with the provided ID for this user'
        });
      }
  
      // Format the response
      const formattedOrder = {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        estimatedDelivery: order.estimatedDelivery,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        total: order.total,
        shippingAddress: order.shippingAddress,
        shippingMethod: order.shippingMethod,
        items: order.items.map(item => ({
          productId: item.idProduct?._id,
          product: item.idProduct ? {
            name: item.idProduct.name,
            description: item.idProduct.description,
            images: item.idProduct.images,
            slug: item.idProduct.slug,
            stock: item.idProduct.stock
          } : null,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          subtotal: item.subtotal
        })),
        history: order.history || []
      };
  
      // Audit log
      await AuditLog.createLog({
        event: 'ORDER_DETAILS_ACCESS',
        user: userId,
        action: 'read',
        source: 'api',
        status: 'success',
        ip: req.ip,
        userAgent: req.get('User-Agent')?.slice(0, 200) || '',
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.total,
          itemCount: order.items.length,
          paymentMethod: order.paymentMethod
        }
      });
  
      res.status(200).json({
        order: formattedOrder,
        message: 'Order details retrieved successfully'
      });
  
    } catch (error) {
      await AuditLog.createLog({
        event: 'ORDER_DETAILS_ACCESS',
        user: req.user?._id,
        action: 'read',
        source: 'api',
        status: 'failure',
        ip: req.ip,
        userAgent: req.get('User-Agent')?.slice(0, 200) || '',
        metadata: {
          error: error.message,
          orderId: req.params.orderId,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
  
      console.error(`Error fetching order details: ${error.message}`);
      res.status(500).json({ 
        error: 'Failed to fetch order details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async cancelOrder(req, res) {
    try {
        const userId = req.user._id;
        const orderId = req.params.id;

        // Validate order ID
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const { error } = cancelOrderSchema.validate(req.body);
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({ errors });
        }

        // Find order and verify ownership (done in cancelOrderinstatic)
        let order;
        try {
            order = await Order.cancelOrder(
                orderId,
                userId,
                req.body.cancellationReason
            );
        } catch (dbError) {
            await AuditLog.createLog({
                event: 'USER_ORDER_UPDATE',
                user: userId,
                action: 'cancel',
                source: 'web',
                status: 'failure',
                ip: req.ip,
                userAgent: req.get('User-Agent')?.slice(0, 200) || '',
                metadata: {
                    error: dbError.message,
                    orderId: orderId
                }
            });
            
            return res.status(404).json({ 
                error: dbError.message 
            });
        }

        // Process refund if order was paid
        let refundResult = null;
            try {
                refundResult = await PaymentProcessor.refund(order);

                // Log successful refund
                await AuditLog.createLog({
                    event: 'PAYMENT_REFUND',
                    user: userId,
                    action: 'refund',
                    source: 'web',
                    status: 'success',
                    ip: req.ip,
                    userAgent: req.get('User-Agent')?.slice(0, 200) || '',
                    metadata: {
                        orderId: order._id,
                        paymentId: order.paymentId,
                        amount: order.total,
                    }
                });
            } catch (refundError) {
                // Log failed refund attempt
                await AuditLog.createLog({
                    event: 'PAYMENT_REFUND',
                    user: userId,
                    action: 'refund',
                    source: 'web',
                    status: 'failure',
                    ip: req.ip,
                    userAgent: req.get('User-Agent')?.slice(0, 200) || '',
                    metadata: {
                        orderId: order._id,
                        paymentId: order.paymentId,
                        error: refundError.message
                    }
                });

                console.error('Refund failed:', refundError);
            }

        // Enhanced audit log
        await AuditLog.createLog({
            event: 'USER_ORDER_CANCELED',
            user: userId,
            action: 'cancel',
            source: 'web',
            status: 'success',
            ip: req.ip,
            userAgent: req.get('User-Agent')?.slice(0, 200) || '',
            metadata: {
                orderId: order._id,
                newValues: {
                    status: order.status,
                    cancellationReason: order.cancellationReason,
                    cancelledAt: order.cancelledAt
                },
                refundProcessed: !!refundResult,
            }
        });

        // Formatted response
        res.status(200).json({
            message: 'Order cancelled successfully',
            refundProcessed: !!refundResult,
            order: {
                _id: order._id,
                status: order.status,
                cancellationReason: order.cancellationReason,
                cancelledAt: order.cancelledAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        await AuditLog.createLog({
            event: 'USER_ORDER_UPDATE',
            user: req.user?._id,
            action: 'cancel',
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

        console.error(`[User] Error cancelling order: ${error.message}`);
        res.status(500).json({ 
            error: 'Failed to cancel order',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
}

module.exports = new OrderController();