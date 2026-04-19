# 🏪 KiranaConnect — Mandi Terminal
> A Bloomberg-terminal-inspired hyperlocal B2B wholesale platform for Rajasthan's kirana ecosystem.

```
┌─────────────────── MANDI TERMINAL ────────────────────────┐
│  KiranaConnect ● LIVE    [Catalogue] [Cart(3)] [Orders]   │
│  🏭 Wholesaler ·  Gupta Traders  ·  14:22:07   [Exit]    │
├─────────────────────────────────────────────────────────────┤
│  ⏳ Next Batch: 03:42:17  ●  12 Pending  ●  Redis HIT 2ms │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗 Architecture

```
kiranaconnect/
├── backend/
│   ├── config/redis.js          # Redis client singleton
│   ├── models/
│   │   ├── User.js              # Dual-role: shopOwner | wholesaler
│   │   ├── Product.js           # Tiered pricing + stock
│   │   ├── Order.js             # Snapshot pricing, status lifecycle
│   │   └── Batch.js             # idempotent batchWindow key
│   ├── middleware/auth.js        # JWT dual-role guard
│   ├── routes/
│   │   ├── auth.js              # /api/auth — login/register
│   │   ├── products.js          # /api/products — cached catalogue
│   │   ├── orders.js            # /api/orders — atomic placement
│   │   └── wholesaler.js        # /api/wholesaler — WS dashboard
│   └── server.js                # Express + Socket.io + Cron
└── frontend/src/
    ├── contexts/
    │   ├── AuthContext.jsx       # JWT + socket room registration
    │   └── CartContext.jsx       # useMemo cart totals
    ├── services/
    │   ├── api.js               # Axios + interceptors
    │   └── socket.js            # Socket.io singleton
    └── components/
        ├── AuthPage.jsx          # Dual-role login/register
        ├── Topbar.jsx            # Live clock + role badge
        ├── BatchTimer.jsx        # Countdown + socket events
        ├── Catalogue.jsx         # Redis HIT/MISS indicator
        ├── Cart.jsx              # useMemo totals verification
        ├── MyOrders.jsx          # Live status tracking
        └── WholesalerDashboard.jsx # 3-panel wholesaler UX
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017
- Redis running locally on port 6379

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed        # Creates demo users + 8 products
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
> Open http://localhost:5173

### Demo Credentials
| Role        | Phone       | Password    |
|-------------|-------------|-------------|
| 🏭 Wholesaler | 9876543210  | password123 |
| 🏪 ShopOwner  | 9111111111  | password123 |
| 🏪 ShopOwner  | 9222222222  | password123 |

---

## 🧠 Technical Deep-Dives

### 1. Order Batching — Why Cron Jobs Must Be Idempotent

```js
// server.js — cron fires every 6 hours via node-cron
// node-cron uses libuv's timer API (setTimeout internally)
cron.schedule('0 0,6,12,18 * * *', async () => {
  const batchWindow = `${year}-${month}-${day}-${hour}-${wholesalerId}`;

  try {
    // UNIQUE INDEX on batchWindow = natural idempotency guard
    await Batch.create({ batchWindow, ... });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key → this window was already batched
      // Safe to skip — no double-batching possible
      console.log('Idempotent skip — already batched');
    }
  }
});
```

**Why idempotency matters:** If the server restarts mid-cron, PM2 revives it, and the cron fires again in the same 6-hour window. Without the unique key, every order gets double-batched. The `batchWindow` string is a deterministic key — same inputs always produce the same key, so re-runs are safe.

**libuv connection:** `node-cron` calls `setTimeout()` under the hood. libuv registers a timer handle in its event loop. When the timer expires, the callback enters the event queue. This is why long-running cron code should be `async` — blocking the loop would delay all I/O.

---

### 2. Redis Product Catalogue Cache — Hit vs Miss Latency

```js
// routes/products.js
const start = Date.now();

const cached = await redisClient.get('products:catalogue');
if (cached) {
  return res.json({
    products: JSON.parse(cached),
    _cache: { hit: true, latency: Date.now() - start }, // typically 1-5ms
  });
}

// Cache miss — MongoDB aggregation (may take 20-80ms)
const products = await Product.aggregate([...]);
await redisClient.setEx('products:catalogue', 86400, JSON.stringify(products));

res.json({
  products,
  _cache: { hit: false, latency: Date.now() - start }, // first load
});
```

The UI shows a live **Redis HIT/MISS badge** with latency. Reload the catalogue page:
- **First load:** `MISS · 45ms` → MongoDB aggregation
- **Second load:** `HIT · 2ms` → pure Redis read

**Cache invalidation:** `redisClient.del('products:catalogue')` is called whenever a product is created or stock is updated. Products change ~once daily in real wholesale — 24h TTL is appropriate.

---

### 3. Avoiding N+1 Queries — The MongoDB `$lookup` Fix

**The N+1 Problem (naive code):**
```js
// ❌ BAD — N+1 queries: 1 to get products, then N to get each wholesaler
const products = await Product.find({ isActive: true });
for (const product of products) {
  product.wholesaler = await User.findById(product.wholesalerId); // N queries!
}
// With 50 products → 51 database round trips
```

**The fix — single aggregation pipeline:**
```js
// ✅ GOOD — 1 query total, MongoDB joins internally
const products = await Product.aggregate([
  { $match: { isActive: true } },
  {
    $lookup: {
      from: 'users',          // collection to join
      localField: 'wholesalerId',
      foreignField: '_id',
      as: 'wholesaler',
      pipeline: [{ $project: { shopName: 1, district: 1 } }], // project only needed fields
    },
  },
  { $unwind: '$wholesaler' },
  { $sort: { category: 1, name: 1 } },
]);
// With 50 products → 1 database round trip, always
```

This pattern is used in three places: product catalogue, shop owner orders, and wholesaler orders.

---

### 4. Inventory Atomic Decrement — No Overselling

```js
// routes/orders.js — the most critical line in the codebase
const product = await Product.findOneAndUpdate(
  {
    _id: productId,
    stock: { $gte: quantity }, // ← ATOMIC CONDITION: only update if stock is sufficient
    isActive: true,
  },
  { $inc: { stock: -quantity } }, // ← decrement
  { new: true }
);

if (!product) {
  // MongoDB returned null → condition failed → stock was insufficient
  // This is atomic — no other request saw stock=0 and decremented it
  return res.status(409).json({ error: 'Insufficient stock', code: 'STOCK_INSUFFICIENT' });
}
```

**Race condition scenario without atomicity:**
```
Request A reads stock = 10, quantity = 10 → "sufficient, proceed"
Request B reads stock = 10, quantity = 10 → "sufficient, proceed"  ← race!
Request A writes stock = 0
Request B writes stock = -10  ← OVERSOLD!
```

**With MongoDB atomic update:**
```
Request A: findOneAndUpdate({stock: {$gte: 10}}, {$inc: {stock: -10}}) → returns product ✅
Request B: findOneAndUpdate({stock: {$gte: 10}}, {$inc: {stock: -10}}) → returns null ✅ (stock is 0)
```
MongoDB's document-level locking ensures these operations serialize automatically.

---

### 5. Dual-Role JWT — One Auth System, Two User Types

```js
// Token payload carries role as a claim
const token = jwt.sign(
  { userId: user._id, role: user.role, shopName: user.shopName },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// middleware/auth.js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access denied', required: roles });
  }
  next();
};

// Route protection — same token, different guards
router.post('/products', authenticate, requireRole('wholesaler'), handler);
router.post('/orders',   authenticate, requireRole('shopOwner'),  handler);
router.get('/my',        authenticate, requireRole('shopOwner'),  handler);
```

Both roles use the same signing secret and verification. The claim `role` in the payload is what differentiates them. A shopOwner token hitting a wholesaler-guarded route gets a clean 403 with `{ required: ['wholesaler'], yourRole: 'shopOwner' }`.

---

### 6. useMemo for Cart Totals — React Performance

```jsx
// CartContext.jsx
const totals = useMemo(() => {
  let subtotal = 0;
  let totalItems = 0;
  const breakdown = items.map(({ product, quantity }) => {
    // Tiered pricing calculation — potentially expensive with many items
    const tier = product.tiers
      ?.filter(t => quantity >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];
    const unitPrice = tier ? tier.pricePerUnit : product.basePrice;
    const lineTotal = unitPrice * quantity;
    subtotal   += lineTotal;
    totalItems += quantity;
    return { productId: product._id, unitPrice, lineTotal, hasTier: !!tier };
  });
  return { subtotal, totalItems, itemCount: items.length, breakdown };
}, [items]); // ← Only recomputes when items array changes
```

**Verifying with React DevTools Profiler:**
1. Open DevTools → Profiler → Record
2. Change something in the parent that doesn't affect the cart (e.g., search bar)
3. Without useMemo: CartContext re-runs the entire calculation
4. With useMemo: `totals` reference is **stable** — no recalculation, no re-renders downstream

The memoization matters most when the cart has 20+ items with tiered pricing — the sort + filter loop runs O(n×t) without it on every keystroke in the search bar.

---

## 🎨 Design Philosophy

**Mandi Terminal** aesthetic: Bloomberg terminal meets Rajasthani bazaar. Dark void background with saffron (#FF6B35) accents — the colour of turmeric, the most traded spice in Indian wholesale markets. JetBrains Mono for all numeric data (prices, stock, latency, IDs). Every number you see is live.

The Redis cache indicator, atomic stock bars, and batch countdown aren't decorations — they are windows into the infrastructure running beneath. Students using this codebase see the system breathe.

---

## 🔌 Socket.io Real-Time Events

| Event       | Direction               | Payload                              |
|-------------|-------------------------|--------------------------------------|
| `joinRoom`  | Client → Server         | `{ role, userId }`                   |
| `newOrder`  | Server → Wholesaler     | `{ orderId, shopName, totalAmount }` |
| `batchReady`| Server → Wholesaler     | `{ batchId, orderCount, window }`    |

Wholesalers join `wholesaler:<id>` room. ShopOwners join `shopOwner:<id>` room. The cron job and order route both use `io.to(room).emit()` for targeted push — no broadcasting to everyone.
