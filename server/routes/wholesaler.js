import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Batch from '../models/Batch.js';
import Product from '../models/Product.js';
import redisClient from '../config/redis.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/wholesaler/orders — All orders for this wholesaler (N+1 fixed)
router.get('/orders', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { wholesalerId: new mongoose.Types.ObjectId(req.user.userId) } },
      {
        $lookup: {
          from:         'users',
          localField:   'shopOwnerId',
          foreignField: '_id',
          as:           'shopOwner',
          pipeline:     [{ $project: { shopName: 1, phone: 1, address: 1 } }],
        },
      },
      { $unwind: '$shopOwner' },
      // Lookup product details for each order item
      {
        $lookup: {
          from:         'products',
          localField:   'items.productId',
          foreignField: '_id',
          as:           'productDetails',
          pipeline:     [{ $project: { name: 1, unit: 1, category: 1, imageUrl: 1, imageEmoji: 1 } }],
        },
      },
      {
        $lookup: {
          from:         'batches',
          localField:   'batchId',
          foreignField: '_id',
          as:           'batch',
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wholesaler/products — This wholesaler's product listings
router.get('/products', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const products = await Product.find({ wholesalerId: req.user.userId }).sort({ category: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wholesaler/batches — Dispatch batch history
router.get('/batches', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const batches = await Batch.find({ wholesalerId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/wholesaler/batches/:id/dispatch — Mark batch as dispatched
router.patch('/batches/:id/dispatch', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { status: 'dispatched', dispatchedAt: new Date() },
      { new: true }
    );
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    await Order.updateMany({ batchId: req.params.id }, { status: 'dispatched' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/wholesaler/orders/:id/dispatch — Mark a single order as dispatched
router.patch('/orders/:id/dispatch', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, wholesalerId: req.user.userId, status: { $in: ['pending', 'batched'] } },
      { status: 'dispatched' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found or already dispatched' });

    // Notify the shop owner via socket
    req.app.get('io').to(`shopOwner:${order.shopOwnerId}`).emit('orderDispatched', {
      orderId: order._id,
      status: 'dispatched',
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/wholesaler/orders/:id/deliver — Mark a single order as delivered
router.patch('/orders/:id/deliver', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, wholesalerId: req.user.userId, status: 'dispatched' },
      { status: 'delivered' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found or not dispatched' });

    req.app.get('io').to(`shopOwner:${order.shopOwnerId}`).emit('orderDelivered', {
      orderId: order._id,
      status: 'delivered',
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/wholesaler/products/:id/restock — Refill stock for an existing product
router.patch('/products/:id/restock', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const { addStock } = req.body;
    if (!addStock || addStock <= 0) {
      return res.status(400).json({ error: 'addStock must be a positive number' });
    }
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, wholesalerId: req.user.userId },
      { $inc: { stock: addStock } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Invalidate cache since stock changed
    await redisClient.del('products:catalogue');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
