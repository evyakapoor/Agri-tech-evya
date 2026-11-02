import { Order } from '../models/Order.js';
import { Resource } from '../models/Resource.js';
import { createNotification } from '../services/notificationService.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }

    if (!deliveryDetails || !deliveryDetails.fullName || !deliveryDetails.phone || !deliveryDetails.address) {
      return res.status(400).json({ success: false, message: 'Complete delivery details are required.' });
    }

    // Server-side inventory & price verification
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid item quantity.' });
      }

      // Atomic stock check and decrement to prevent overselling
      const product = await Resource.findOneAndUpdate(
        { _id: item.resourceId || item._id, stockQuantity: { $gte: quantity }, approvalStatus: 'Approved' },
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );

      if (!product) {
        // Rollback any already decremented items
        for (const rolledBackItem of orderItems) {
          await Resource.findByIdAndUpdate(rolledBackItem.resource, {
            $inc: { stockQuantity: rolledBackItem.quantity },
          });
        }
        return res.status(400).json({
          success: false,
          message: `Insufficient stock or unavailable item for "${item.name || 'requested product'}". Please adjust quantity.`,
        });
      }

      const subtotal = product.price * quantity;
      calculatedTotal += subtotal;

      orderItems.push({
        resource: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      total: calculatedTotal,
      status: 'Confirmed',
      paymentMethod: 'Cash on Delivery (Standard Agritech Fulfillment)',
      deliveryDetails,
    });

    // Notify user
    await createNotification({
      userId: req.user._id,
      title: 'Order Confirmed',
      message: `Your agricultural order #${order._id.toString().slice(-6)} has been placed successfully. Payment mode: Cash on Delivery.`,
      type: 'Order Update',
      link: '/marketplace',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Mode: Cash on Delivery.',
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // If order is cancelled, restore stock
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Resource.findByIdAndUpdate(item.resource, {
          $inc: { stockQuantity: item.quantity },
        });
      }
    }

    // Notify user
    await createNotification({
      userId: order.user,
      title: 'Order Status Update',
      message: `Your order #${order._id.toString().slice(-6)} status has been updated to "${status}".`,
      type: 'Order Update',
      link: '/marketplace',
    });

    res.status(200).json({
      success: true,
      message: `Order marked as ${status}.`,
      order,
    });
  } catch (err) {
    next(err);
  }
};
