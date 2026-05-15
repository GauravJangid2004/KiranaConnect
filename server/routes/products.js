/**
 * PRODUCT ROUTES — Member 2 (Redis Cache + Product Catalogue)
 *
 * KEY CONCEPTS:
 *   1. REDIS CACHING with 24h TTL (setEx / get / del)
 *   2. N+1 QUERY ELIMINATION via MongoDB $lookup aggregation
 *   3. CACHE METADATA returned to UI as _cache: { hit, latency }
 */
import { Router } from 'express';
import redisClient, { redisReady } from '../config/redis.js';
import Product from '../models/Product.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const CACHE_KEY = 'products:catalogue';
const CACHE_TTL = 86400; // 24 hours in seconds

/**
 * GET /api/products
 * Returns products with wholesaler info via $lookup aggregation.
 * Cached in Redis with 24h TTL. Returns _cache metadata for UI badge.
 */
router.get('/', authenticate, async (req, res) => {
  const start = Date.now();
  try {
    // ── Step 1: Check Redis cache ───────────────────────────────────
    if (redisReady) {
      try {
        const cached = await redisClient.get(CACHE_KEY);
        if (cached) {
          return res.json({
            products: JSON.parse(cached),
            _cache: { hit: true, latency: Date.now() - start },
          });
        }
      } catch (err) {
        console.warn('⚠️  Redis GET failed, falling back to DB:', err.message);
      }
    }

    // ── Step 2: Cache miss — single $lookup pipeline (no N+1) ──────
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'wholesalerId',
          foreignField: '_id',
          as: 'wholesaler',
          pipeline: [{ $project: { shopName: 1, district: 1, phone: 1 } }],
        },
      },
      { $unwind: '$wholesaler' },
      { $sort: { category: 1, name: 1 } },
    ]);

    // ── Step 3: Store in Redis with 24h TTL ─────────────────────────
    if (redisReady) {
      try {
        await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(products));
      } catch (err) {
        console.warn('⚠️  Redis SET failed:', err.message);
      }
    }

    res.json({
      products,
      _cache: { hit: false, latency: Date.now() - start },
    });
  } catch (err) {
    console.error('❌ [Products GET] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/products — Wholesaler lists new product; invalidates cache
 */
router.post('/', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, wholesalerId: req.user.userId });
    if (redisReady) {
      try { await redisClient.del(CACHE_KEY); } catch {}
    }
    console.log('🗑️  [Cache] Invalidated after new product');
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/products/:id/stock — Manual restock; invalidates cache
 */
router.patch('/:id/stock', authenticate, requireRole('wholesaler'), async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, wholesalerId: req.user.userId },
      { $set: { stock: req.body.stock } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (redisReady) {
      try { await redisClient.del(CACHE_KEY); } catch {}
    }
    console.log('🗑️  [Cache] Invalidated after stock update');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
