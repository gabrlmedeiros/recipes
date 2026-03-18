import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { recipeRoutes } from './modules/recipes/recipes.routes.js';
import { swaggerConfig, swaggerUiConfig } from './shared/swagger/swagger.config.js';

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env['CORS_ORIGIN'] ?? true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// Global rate limit: 30 requests per minute per IP
await app.register(rateLimit, {
  global: true,
  max: 30,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    data: null,
    error: { message: 'Muitas tentativas. Tente novamente em instantes.', code: 'RATE_LIMIT_EXCEEDED' },
  }),
});

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

app.listen({ port: Number(process.env['PORT'] ?? 3000), host: '0.0.0.0' });
