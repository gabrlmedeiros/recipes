import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { recipeRoutes } from './modules/recipes/recipes.routes.js';
import { swaggerConfig, swaggerUiConfig } from './shared/swagger/swagger.config.js';

interface BuildAppOptions {
  logger?: boolean;
  disableRateLimit?: boolean;
}

export async function buildApp(opts: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger ?? true,
    ajv: {
      customOptions: {
        strict: false, // permite keywords OpenAPI como 'example' nos schemas
      },
    },
  });

  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  if (!opts.disableRateLimit) {
    await app.register(rateLimit, {
      global: true,
      max: 30,
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        data: null,
        error: { message: 'Muitas tentativas. Tente novamente em instantes.', code: 'RATE_LIMIT_EXCEEDED' },
      }),
    });
  }

  await app.register(swagger, swaggerConfig);
  await app.register(swaggerUi, swaggerUiConfig);

  app.setErrorHandler(errorHandler);

  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Verificação de saúde geral da API',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } },
            error: { type: 'null' },
          },
        },
      },
    },
  }, async () => ({ data: { status: 'ok' }, error: null }));

  app.register(authRoutes, { prefix: '/auth' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(recipeRoutes, { prefix: '/recipes' });

  return app;
}
