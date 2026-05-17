import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import cron from 'node-cron';
import dns from 'dns';

// Prefer IPv4 to avoid DNS resolution issues on some systems
dns.setDefaultResultOrder('ipv4first');

import Order from './models/Order.js';
import Batch from './models/Batch.js';
import './config/redis.js'; // Connect Redis on startup

import authRoutes       from './routes/auth.js';
import productRoutes    from './routes/products.js';
import orderRoutes      from './routes/orders.js';
import wholesalerRoutes from './routes/wholesaler.js';

// JWT_SECRET dev fallback
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  process.env.JWT_SECRET = 'kiranaconnect-local-dev-secret';
  console.warn('⚠ JWT_SECRET not set — using local dev fallback. Set it in .env for production.');
}

const app        = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

app.set('io', io);

// Allow any localhost port in dev + configured CLIENT_URL in prod
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    if (origin === process.env.CLIENT_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/wholesaler', wholesalerRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date(), service: 'KiranaConnect Mandi Terminal' })
);

// ── Socket.io — Role-based rooms ─────────────────────────
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ role, userId }) => {
    socket.join(`${role}:${userId}`);
    console.log(`🔌 [Socket] ${role} ${userId} joined`);
  });
  socket.on('disconnect', () => console.log('🔌 [Socket] Client disconnected'));
});

// ── ORDER BATCHING CRON JOB ──────────────────────────────
/**
 * Runs every 6 hours: 00:00, 06:00, 12:00, 18:00
 *
 * IDEMPOTENCY: batchWindow is a unique composite key.
 * If the server restarts mid-cron, the second run hits the
 * unique index → code 11000 → silent skip. No double-batching.
 *
 * node-cron uses libuv's timer API (setTimeout internally).
 * libuv fires the callback when the timer expires and the
 * call stack is clear — same event-loop mechanism as setInterval.
 */
cron.schedule('0 0,6,12,18 * * *', async () => {
  console.log(`\n⚙️  [Batch Cron] Triggered at ${new Date().toISOString()}`);
  try {
    const now        = new Date();
    const baseWindow = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`;
    const pending    = await Order.find({ status: 'pending' });

    if (pending.length === 0) {
      console.log('📭 [Batch Cron] No pending orders');
      return;
    }

    // Group by wholesaler
    const byWholesaler = pending.reduce((acc, order) => {
      const key = order.wholesalerId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(order._id);
      return acc;
    }, {});

    for (const [wholesalerId, orderIds] of Object.entries(byWholesaler)) {
      const batchWindow = `${baseWindow}-${wholesalerId}`;
      try {
        const batch = await Batch.create({
          batchWindow, orders: orderIds, wholesalerId,
          totalOrders: orderIds.length, scheduledDispatch: now, status: 'aggregating',
        });
        await Order.updateMany({ _id: { $in: orderIds } }, { status: 'batched', batchId: batch._id });
        io.to(`wholesaler:${wholesalerId}`).emit('batchReady', {
          batchId: batch._id, orderCount: orderIds.length, window: baseWindow,
        });
        console.log(`✅ [Batch Cron] Batched ${orderIds.length} orders → wholesaler ${wholesalerId}`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⏭️  [Batch Cron] Window ${batchWindow} already batched (idempotent skip)`);
        } else {
          console.error(`❌ [Batch Cron] Error:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ [Batch Cron] Fatal:', err);
  }
});

console.log('⚙️  Batch cron scheduled: 0 0,6,12,18 * * *');

// ── STARTUP ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kiranaconnect', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('⚠ Running without MongoDB — auth will fail. Start MongoDB and restart.');
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 KiranaConnect Mandi Terminal → http://localhost:${PORT}`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} in use. Set PORT= to a free port.`);
      process.exit(1);
    }
  });
}

bootstrap();
