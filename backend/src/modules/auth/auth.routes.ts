import type { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { authRouteRateLimit } from '../../shared/middlewares/route-rate-limit.js';
import { authMiddleware } from '../../shared/middlewares/auth-middleware.js';

const tokenResponse = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token JWT de acesso' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            login: { type: 'string' },
          },
        },
      },
    },
    error: { type: 'null' },
  },
};

const errorResponse = {
  type: 'object',
  properties: {
    data: { type: 'null' },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
};

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', {
    ...authRouteRateLimit,
    schema: {
      tags: ['Auth'],
      summary: 'Cadastrar novo usuário',
      body: {
        type: 'object',
        required: ['name', 'login', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, description: 'Nome completo', example: 'João Silva' },
          login: { type: 'string', minLength: 3, maxLength: 100, description: 'Nome de usuário único', example: 'joaosilva' },
          password: { type: 'string', minLength: 6, maxLength: 100, description: 'Senha (mínimo 6 caracteres)', example: 'senha123' },
        },
      },
      response: {
        201: tokenResponse,
        400: errorResponse,
        409: errorResponse,
        429: errorResponse,
      },
    },
  }, authController.register);

  app.post('/login', {
    ...authRouteRateLimit,
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar e receber token JWT',
      body: {
        type: 'object',
        required: ['login', 'password'],
        properties: {
          login: { type: 'string', description: 'Nome de usuário', example: 'joaosilva' },
          password: { type: 'string', description: 'Senha', example: 'senha123' },
        },
      },
      response: {
        200: tokenResponse,
        401: errorResponse,
        429: errorResponse,
      },
    },
  }, authController.login);

  app.post('/logout', {
    preHandler: authMiddleware,
    schema: {
      tags: ['Auth'],
      summary: 'Invalidar o token JWT atual (logout)',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: { success: { type: 'boolean', example: true } },
            },
            error: { type: 'null' },
          },
        },
        401: errorResponse,
      },
    },
  }, authController.logout);
}
