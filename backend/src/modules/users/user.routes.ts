import { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ data: { module: 'users' }, error: null }));
}
