# Member 4 — Setup & Push Guide
## KiranaConnect | Batching + Wholesaler Dashboard

---

## Files You Own (7 total)

| File | Location |
|------|----------|
| `models/Batch.js` | `backend/models/Batch.js` |
| `routes/wholesaler.js` | `backend/routes/wholesaler.js` |
| `server.js` | `backend/server.js` ← (cron + socket.io) |
| `WholesalerDashboard.jsx` | `frontend/src/components/WholesalerDashboard.jsx` |
| `BatchTimer.jsx` | `frontend/src/components/BatchTimer.jsx` |
| `vite.config.js` | `frontend/vite.config.js` |
| `package.json` | `backend/package.json` |

**Bonus helper (also yours):** `frontend/src/services/socket.js`

---

## Step 1 — Clone the repo & switch to your branch

```bash
git clone https://github.com/GauravJangid2004/KiranaConnect.git
cd KiranaConnect
git checkout Batching+Wholesaler
```

---

## Step 2 — Copy your files into the repo

Copy from the downloaded zip into the correct paths above.

---

## Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

---

## Step 4 — Create `.env` in `/backend`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kiranaconnect
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_here
REDIS_URL=redis://localhost:6379
```

---

## Step 5 — Run the project

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## Step 6 — Push to your branch

```bash
git add .
git commit -m "feat: Member 4 - Batching + Wholesaler Dashboard + Socket.io"
git push origin Batching+Wholesaler
```

---

## Key Concepts to Explain in Viva

### 1. node-cron expression: `0 0,6,12,18 * * *`
- `0` = minute 0
- `0,6,12,18` = at midnight, 6am, noon, 6pm
- `* * *` = every day, every month, every weekday
- node-cron uses libuv's timer API under the hood — `setInterval` at the OS level

### 2. Idempotency via unique index on `batchWindow`
- Each cron run computes the same `batchWindow` timestamp for that 6-hour slot
- `Batch.create()` with a duplicate `batchWindow` throws **E11000** (MongoDB duplicate key)
- We catch that error and silently skip — **no double-batching**, even if the server restarts mid-run

### 3. Socket.io targeted rooms
```js
io.to(`wholesaler:${id}`).emit('newBatch', data)
// Only that wholesaler's connected client(s) receive this event
```
- Wholesalers join their room by calling `socket.emit('joinRoom', { userId, role })`
- This is how Socket.io scales notifications without broadcasting to everyone

### 4. BatchTimer countdown
- Calculates next 6-hour boundary (0/6/12/18 UTC) from client clock
- Re-syncs when server emits `nextBatchWindow` after each cron run
- Color feedback: green → yellow (< 1hr) → red (< 30min)
