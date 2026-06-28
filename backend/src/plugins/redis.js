import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';
import { config } from '../config/env.js';

export default fp(async (fastify) => {
  await fastify.register(fastifyRedis, {
    url: config.REDIS_URL,
  });
});
