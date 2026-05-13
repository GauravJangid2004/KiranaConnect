import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { authenticate, requireRole } from './middleware/auth.js';

// Fix DNS resolution issue by preferring IPv4
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET && !isProduction) {
  process.env.JWT_SECRET = 'kiranaconnect-local-dev-secret';
  console.warn('JWT_SECRET not set. Using a local development fallback.');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
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

const PORT = process.env.PORT || 5000;

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Auth server running on http://localhost:${PORT}`);
    console.log(`Auth store: ${process.env.AUTH_STORE === 'memory' ? 'memory fallback' : 'MongoDB'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other server or set PORT to a free port.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}

async function bootstrap() {
  if (process.env.AUTH_STORE === 'memory') {
    console.warn('AUTH_STORE=memory. Running without MongoDB persistence.');
    startServer();
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kiranaconnect_auth', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    console.log('MongoDB connected successfully');
    startServer();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (isProduction) {
      console.error('Set MONGO_URI to a reachable MongoDB instance before starting production.');
      process.exit(1);
    }

    process.env.AUTH_STORE = 'memory';
    console.warn('Falling back to in-memory auth store for local development.');
    startServer();
  }
}

bootstrap();
