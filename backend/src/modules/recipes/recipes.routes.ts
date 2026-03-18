import { FastifyInstance } from 'fastify';
import { routeRateLimit } from '../../shared/middlewares/route-rate-limit.js';

export async function recipeRoutes(app: FastifyInstance) {
  app.get('/health', {
    ...routeRateLimit,
    schema: {
      tags: ['Recipes'],
      summary: 'Verificação de saúde — módulo de receitas',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'object', properties: { module: { type: 'string', example: 'recipes' } } },
            error: { type: 'null' },
          },
        },
      },
    },
  }, async () => ({ data: { module: 'recipes' }, error: null }));
}
