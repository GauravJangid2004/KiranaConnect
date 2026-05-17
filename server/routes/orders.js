import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import redisClient from '../config/redis.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/orders
 * ATOMIC STOCK DECREMENT using findOneAndUpdate with conditional filter.
 *
 * The key insight: { stock: { $gte: quantity } } in the filter means MongoDB
 * only executes the $inc if stock is sufficient. This is a single atomic operation
 * — no race conditions, no overselling possible, no application-level locks needed.
 *
 * If two requests arrive simultaneously for the last 10 units:
 *   Request A: finds stock=10, decrements → stock=0 ✅
 *   Request B: finds stock=0, filter fails → returns null → 409 ✅
 */
router.post('/', authenticate, requireRole('shopOwner'), async (req, res) => {
  try {
    const { wholesalerId, items } = req.body;
    let totalAmount = 0;
    const processedItems = [];

    for (const { productId, quantity } of items) {
      // ATOMIC: Only updates if stock >= quantity. Returns null if insufficient.
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity }, isActive: true },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        // Roll back already-decremented products in this loop (best-effort)
        for (const done of processedItems) {
          await Product.findByIdAndUpdate(done.productId, { $inc: { stock: done.quantity } });
        }
        return res.status(409).json({
          error: `Insufficient stock. Atomic check failed — no overselling possible.`,
          code:  'STOCK_INSUFFICIENT',
          productId,
        });
      }

      const priceAtOrder = product.getPriceForQty(quantity);
      totalAmount += priceAtOrder * quantity;
      processedItems.push({ productId, quantity, priceAtOrder });
    }

    const order = await Order.create({
      shopOwnerId: req.user.userId,
      wholesalerId,
      items:       processedItems,
      totalAmount,
      status:      'pending',
    });

    // Stock changed — invalidate Redis catalogue cache
    await redisClient.del('products:catalogue');

    // Real-time notify the wholesaler via Socket.io
    req.app.get('io').to(`wholesaler:${wholesalerId}`).emit('newOrder', {
      orderId:     order._id,
      shopName:    req.user.shopName,
      totalAmount,
      itemCount:   items.length,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/orders/my — ShopOwner's order history.
 * N+1 FIX: Single $lookup pipeline joins Orders + Products + Users + Batches.
 * Naive code would be: orders.map(o => User.findById(o.wholesalerId)) → N queries.
 */
router.get('/my', authenticate, requireRole('shopOwner'), async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { shopOwnerId: new mongoose.Types.ObjectId(req.user.userId) } },
      {
        $lookup: {
          from:         'users',
          localField:   'wholesalerId',
          foreignField: '_id',
          as:           'wholesaler',
          pipeline:     [{ $project: { shopName: 1, phone: 1, address: 1 } }],
        },
      },
      { $unwind: '$wholesaler' },
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

// GET /api/orders/batch-status — Next dispatch time + pending count (for BatchTimer UI)
router.get('/batch-status', authenticate, async (req, res) => {
  try {
    const pendingCount = await Order.countDocuments({ status: 'pending' });

    const now = new Date();
    // Find the next 6-hour slot: 0, 6, 12, 18
    const nextHour = Math.ceil((now.getHours() + 1) / 6) * 6;
    const nextBatch = new Date(now);
    nextBatch.setHours(nextHour % 24, 0, 0, 0);
    if (nextHour >= 24) nextBatch.setDate(nextBatch.getDate() + 1);

    res.json({ pendingCount, nextBatchAt: nextBatch.toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
