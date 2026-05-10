import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('[Redis]', err.message));

export async function connectRedis() {
  if (!redisClient.isOpen) await redisClient.connect();
}

export default redisClient;
