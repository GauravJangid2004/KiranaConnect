import jwt from 'jsonwebtoken';

/**
 * DUAL-ROLE JWT AUTH
 * Token payload carries: { userId, role, shopName }
 * - ShopOwner tokens: role = "shopOwner"
 * - Wholesaler tokens: role = "wholesaler"
 * Same signing secret, same verification — roles live in claims.
 */
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token — access denied' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role guard factory — checks req.user.role against allowed roles.
 * Usage: requireRole('wholesaler')  or  requireRole('shopOwner', 'wholesaler')
 * This is how a single auth system serves two distinct user types cleanly.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      error:         'Access denied',
      required:      roles,
      yourRole:      req.user?.role,
    });
  }
  next();
};
