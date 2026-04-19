import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { authenticate, requireRole } from './middleware/auth.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', service: 'KiranaConnect Auth Member 1 Branch' });
});

app.get('/api/shop-owner/dashboard', authenticate, requireRole('shopOwner'), (req, res) => {
  res.json({
    message: `Welcome shop owner ${req.user.shopName}`,
    user: req.user,
  });
});

app.get('/api/wholesaler/dashboard', authenticate, requireRole('wholesaler'), (req, res) => {
  res.json({
    message: `Welcome wholesaler ${req.user.shopName}`,
    user: req.user,
  });
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kiranaconnect_auth')
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Auth server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
