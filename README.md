# KiranaConnect — Mandi Terminal
> A Bloomberg-terminal-inspired hyperlocal B2B wholesale platform for Rajasthan's kirana ecosystem.

Project no.- 08

Project Title- KiranaConnect

Group no.-08

Group members: Gaurav Jangid (Team leader) | Arpan Goyal | Shifa Soni | Asi Jain

Description: From this, Kirana shop owners place bulk orders from nearby wholesalers. Wholesalers list products with minimum order quantities and tiered pricing. Orders are batched every 6 hours and dispatched together. A simplified Udaan for the district.


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
- MongoDB running on online cloud DB (MongoDB Atlas)
- Redis running on online cloud DB (Upstash)

### Backend
```bash
cd server
npm install
npm run seed        # Creates demo users + 8 products
npm run dev
```

### Frontend
```bash
cd client
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

## 🎨 Design Philosophy

**Mandi Terminal** aesthetic: Bloomberg terminal meets Rajasthani bazaar. Dark void background with saffron (#FF6B35) accents — the colour of turmeric, the most traded spice in Indian wholesale markets. JetBrains Mono for all numeric data (prices, stock, latency, IDs). Every number you see is live.

The Redis cache indicator, atomic stock bars, and batch countdown aren't decorations — they are windows into the infrastructure running beneath. Students using this codebase see the system breathe.

---
