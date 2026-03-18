import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ data: { module: 'auth' }, error: null }));
}
