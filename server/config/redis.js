/**
 * REDIS CLIENT CONFIGURATION — Member 2 (Redis Cache + Product Catalogue)
 *
 * Connects to Upstash Redis via TLS (rediss:// protocol).
 * Connection is non-blocking: if Redis is unreachable, the server still boots
 * and product routes fall back to direct MongoDB queries (cache miss behavior).
 *
 * KEY METHODS USED:
 *   redisClient.setEx(key, ttl, data) — SET with EXpiry (24h = 86400 seconds)
 *   redisClient.get(key)              — GET cached data (returns null on miss)
 *   redisClient.del(key)              — DELETE to invalidate on product write
 */
import { createClient } from 'redis';

let redisReady = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 3) return false; // stop reconnecting after 3 attempts
      return Math.min(retries * 1000, 3000);
    },
  },
});

redisClient.on('error', (err) => {
  // Only log once, not on every reconnect cycle
  if (redisReady) {
    redisReady = false;
    console.error('❌ Redis disconnected:', err.message);
  }
});

redisClient.on('ready', () => {
  redisReady = true;
  console.log('✅ Redis connected and ready');
});

// Non-blocking connect — server boots regardless
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('⚠️  Redis connection failed:', err.message);
    console.warn('⚠️  Server running without cache — all requests hit MongoDB');
  }
})();

export { redisReady };
export default redisClient;
