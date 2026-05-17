import jwt from 'jsonwebtoken';

/**
 * DUAL-ROLE JWT AUTH
 * Token payload carries: { userId, role, shopName }
 * - ShopOwner tokens: role = "shopOwner"
 * - Wholesaler tokens: role = "wholesaler"
 * Same signing secret, same verification — roles live in claims.
 */
export function authenticate(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme || '') || !token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Role guard factory — checks req.user.role against allowed roles.
 * Usage: requireRole('wholesaler')  or  requireRole('shopOwner', 'wholesaler')
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (roles.length === 0) {
    return res.status(500).json({ error: 'Role guard misconfigured' });
  }
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error:    'Access denied',
      required: roles,
      yourRole: req.user.role,
    });
  }
  return next();
};
