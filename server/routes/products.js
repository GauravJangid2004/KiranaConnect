import { Router } from 'express';
import Product from '../models/Product.js';
import redisClient from '../config/redis.js';

const router = Router();
const CACHE_KEY = 'catalogue:v1';
const CACHE_TTL = 86400; // 24 hours in seconds

// ─── GET /api/products — Catalogue with Redis cache + $lookup ────────────────

router.get('/', async (req, res) => {
  const start = Date.now();

  try {
    // 1. Try Redis cache first
    const cached = await redisClient.get(CACHE_KEY);

    if (cached) {
      return res.json({
        data: JSON.parse(cached),
        _cache: { hit: true, latency: Date.now() - start },
      });
    }

    // 2. Cache miss — run $lookup aggregation (avoids N+1)
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'wholesaler',
          foreignField: '_id',
          as: 'wholesaler',
        },
      },
      { $unwind: '$wholesaler' },
      {
        $project: {
          name: 1,
          category: 1,
          unit: 1,
          stock: 1,
          minOrderQty: 1,
          tiers: 1,
          'wholesaler._id': 1,
          'wholesaler.shopName': 1,
        },
      },
      { $sort: { category: 1, name: 1 } },
    ]);

    // 3. Store in Redis with 24h TTL
    await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(products));

    res.json({
      data: products,
      _cache: { hit: false, latency: Date.now() - start },
    });
  } catch (err) {
    console.error('[Products] GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch catalogue' });
  }
});

// ─── POST /api/products — Add new product + invalidate cache ─────────────────

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Invalidate cache so new product appears in catalogue
    await redisClient.del(CACHE_KEY);

    res.status(201).json({ data: product });
  } catch (err) {
    console.error('[Products] POST error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /api/products/:id — Update product + invalidate cache ───────────────

router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ error: 'Product not found' });

    // Invalidate cache so next GET fetches fresh data
    await redisClient.del(CACHE_KEY);

    res.json({ data: updated });
  } catch (err) {
    console.error('[Products] PUT error:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

export default router;
