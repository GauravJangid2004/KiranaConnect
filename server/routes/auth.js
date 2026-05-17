import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const ROLES = new Set(['shopOwner', 'wholesaler']);

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '');
const normalizeText  = (value = '') => String(value).trim();
const normalizeGst   = (value = '') => String(value).trim().toUpperCase();

function signToken(user) {
  return jwt.sign(
    { userId: String(user._id), role: user.role, shopName: user.shopName },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  return {
    id:         user._id,
    name:       user.name,
    phone:      user.phone,
    role:       user.role,
    shopName:   user.shopName,
    district:   user.district,
    address:    user.address,
    gstNumber:  user.gstNumber,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const payload = {
      name:       normalizeText(req.body.name),
      phone:      normalizePhone(req.body.phone),
      password:   req.body.password || '',
      role:       normalizeText(req.body.role),
      shopName:   normalizeText(req.body.shopName),
      district:   normalizeText(req.body.district),
      address:    normalizeText(req.body.address),
      gstNumber:  normalizeGst(req.body.gstNumber),
    };

    if (!payload.name || !payload.phone || !payload.password || !payload.role || !payload.shopName || !payload.district) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    if (!ROLES.has(payload.role)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }
    if (payload.phone.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
    }
    if (payload.password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (payload.role === 'wholesaler' && payload.gstNumber && payload.gstNumber.length !== 15) {
      return res.status(400).json({ error: 'GST number must be 15 characters' });
    }

    const existing = await User.findOne({ phone: payload.phone });
    if (existing) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    if (payload.role !== 'wholesaler') payload.gstNumber = '';

    const user = await User.create(payload);
    res.status(201).json({ token: signToken(user), user: safeUser(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const phone    = normalizePhone(req.body.phone);
    const password = req.body.password || '';

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }
    if (phone.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
    }

    const user = await User.findOne({ phone }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — validate token and return fresh user (used by AuthContext on reload)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
