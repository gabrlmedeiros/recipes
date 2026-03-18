import { FastifyInstance } from 'fastify';
import { routeRateLimit } from '../../shared/middlewares/route-rate-limit.js';

export async function userRoutes(app: FastifyInstance) {
  app.get('/health', {
    ...routeRateLimit,
    schema: {
      tags: ['Users'],
      summary: 'Verificação de saúde — módulo de usuários',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'object', properties: { module: { type: 'string', example: 'users' } } },
            error: { type: 'null' },
          },
        },
      },
    },
  }, async () => ({ data: { module: 'users' }, error: null }));
}
