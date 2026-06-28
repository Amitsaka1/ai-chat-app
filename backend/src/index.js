import Fastify from 'fastify';
import { config } from './config/env.js';
import corsPlugin from './plugins/cors.js';
import redisPlugin from './plugins/redis.js';

const fastify = Fastify({ logger: true });

// Health check - sabse pehle register karo
fastify.get('/health', async () => ({ status: 'ok' }));

// Plugins
await fastify.register(corsPlugin);
await fastify.register(redisPlugin);

// Start
try {
  await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
