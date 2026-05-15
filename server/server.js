/**
 * SERVER — Member 2 (Redis Cache + Product Catalogue)
 * Simplified server with only auth + product routes.
 * No socket.io, no node-cron (those belong to Member 4).
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import './config/redis.js'; // Connect Redis on startup

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date(), service: 'KiranaConnect — Member 2 Server' })
);

// ─── STARTUP ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 KiranaConnect Server → http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
