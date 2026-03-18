import { FastifyInstance } from 'fastify';

export async function recipeRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ data: { module: 'recipes' }, error: null }));
}
