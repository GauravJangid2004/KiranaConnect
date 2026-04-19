import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const ROLES = new Set(['shopOwner', 'wholesaler']);

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '');
const normalizeText = (value = '') => String(value).trim();

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    shopName: user.shopName,
    district: user.district,
    address: user.address,
    gstNumber: user.gstNumber,
  };
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role, shopName: user.shopName },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const payload = {
      name: normalizeText(req.body.name),
      phone: normalizePhone(req.body.phone),
      password: req.body.password || '',
      role: normalizeText(req.body.role),
      shopName: normalizeText(req.body.shopName),
      district: normalizeText(req.body.district),
      address: normalizeText(req.body.address),
      gstNumber: normalizeText(req.body.gstNumber),
    };

    if (!payload.name || !payload.phone || !payload.password || !payload.role || !payload.shopName || !payload.district) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!ROLES.has(payload.role)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    if (payload.phone.length < 10) {
      return res.status(400).json({ error: 'Enter a valid phone number' });
    }

    if (payload.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ phone: payload.phone });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this phone number' });
    }

    if (payload.role !== 'wholesaler') {
      payload.gstNumber = '';
    }

    const user = await User.create(payload);
    res.status(201).json({ token: signToken(user), user: safeUser(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = req.body.password || '';

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
