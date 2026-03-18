import type { SwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Recipe Manager API',
      description: 'API para gerenciamento de receitas, usuários e autenticação.',
      version: '1.0.0',
    },
    tags: [
      { name: 'Health', description: 'Verificação de saúde dos serviços' },
      { name: 'Auth', description: 'Cadastro, login e logout' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      { name: 'Recipes', description: 'Gerenciamento de receitas' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
};

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
};
