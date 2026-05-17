import { Router } from 'express';
import redisClient from '../config/redis.js';
import Product from '../models/Product.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const CACHE_KEY = 'products:catalogue';
const CACHE_TTL = 86400; // 24 hours in seconds

/**
 * GET /api/products
 * REDIS CACHE: Products change ~once daily → perfect for 24h TTL cache.
 * Returns _cache metadata { hit, latency } so the UI can display cache performance.
 *
 * N+1 FIX: Instead of fetching each product then querying wholesaler separately,
 * one $lookup aggregation joins products + users in a SINGLE MongoDB pipeline.
 * Naive code would do: products.forEach(p => User.findById(p.wholesalerId))
 * = N+1 database round-trips. Aggregation = 1 round-trip always.
 */
router.get('/', authenticate, async (req, res) => {
  const start = Date.now();
  try {
    // Check Redis cache first
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      return res.json({
        products: JSON.parse(cached),
        _cache: { hit: true, latency: Date.now() - start },
      });
    }

    // Cache miss — single aggregation pipeline (no N+1 queries)
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from:     'users',
          localField: 'wholesalerId',
          foreignField: '_id',
          as:       'wholesaler',
          pipeline: [{ $project: { shopName: 1, district: 1, phone: 1 } }],
        },
      },
      { $unwind: '$wholesaler' },
      { $sort: { category: 1, name: 1 } },
    ]);

    // Store in Redis with 24h TTL
    await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(products));

    res.json({
      products,
      _cache: { hit: false, latency: Date.now() - start },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — Wholesaler lists new product; invalidates cache
router.post('/', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, wholesalerId: req.user.userId });
    await redisClient.del(CACHE_KEY); // Invalidate on write
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/products/:id/stock — Manual restock; invalidates cache
router.patch('/:id/stock', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, wholesalerId: req.user.userId },
      { $set: { stock: req.body.stock } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await redisClient.del(CACHE_KEY);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
