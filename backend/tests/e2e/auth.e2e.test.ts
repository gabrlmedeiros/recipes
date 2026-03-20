import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (pw: string) => `hashed-${pw}`),
  compare: jest.fn(async (pw: string, hash: string) => hash === `hashed-${pw}`),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn((token: string) => {
    if (token === 'mock-jwt-token') return { sub: '00000000-0000-0000-0000-000000000001' };
    throw new Error('invalid token');
  }),
}));

describe('Auth routes — E2E', () => {
  let app: INestApplication;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        _created: null,
        findUnique: jest.fn(async ({ where: { login } }: any) => {
          return mockPrisma.user._created && mockPrisma.user._created.login === login
            ? mockPrisma.user._created
            : null;
        }),
        create: jest.fn(async ({ data }: any) => {
          mockPrisma.user._created = { id: '00000000-0000-0000-0000-000000000001', ...data, createdAt: new Date(), updatedAt: new Date() };
          return mockPrisma.user._created;
        }),
      },
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    const { HttpExceptionFilter } = await import('../../src/common/filters/http-exception.filter');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('retorna 201 e token ao cadastrar novo usuário', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').set('X-Platform', 'mobile').send({ name: 'João', login: 'joao', password: 'senha123' });
      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.login).toBe('joao');
    });

    it('retorna 409 quando o login já está em uso', async () => {
      mockPrisma.user._created = { id: '00000000-0000-0000-0000-000000000001', name: 'X', login: 'exists', password: 'p' };
      const res = await request(app.getHttpServer()).post('/auth/register').send({ name: 'YY', login: 'exists', password: 'senha123' });
      expect(res.status).toBe(409);
    });

    it('retorna 400 quando o corpo está faltando campos obrigatórios', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').send({ login: 'joao' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('retorna 200 e token com credenciais válidas', async () => {
      await request(app.getHttpServer()).post('/auth/register').set('X-Platform', 'mobile').send({ name: 'João', login: 'joao', password: 'senha123' });

      const res = await request(app.getHttpServer()).post('/auth/login').set('X-Platform', 'mobile').send({ login: 'joao', password: 'senha123' });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('retorna 401 com senha incorreta', async () => {
      mockPrisma.user._created = { id: '00000000-0000-0000-0000-000000000001', name: 'João', login: 'joao', password: 'hashed-senha123' };
      const res = await request(app.getHttpServer()).post('/auth/login').send({ login: 'joao', password: 'senha-errada' });
      expect(res.status).toBe(401);
    });

    it('retorna 401 quando o usuário não existe', async () => {
      mockPrisma.user._created = null;
      const res = await request(app.getHttpServer()).post('/auth/login').send({ login: 'naoexiste', password: 'senha123' });
      expect(res.status).toBe(401);
    });

    it('retorna 400 quando o corpo está vazio', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('retorna 401 sem Authorization header', async () => {
      const res = await request(app.getHttpServer()).post('/auth/logout');
      expect(res.status).toBe(401);
    });

    it('retorna 200 e invalida o token com JWT válido', async () => {
      const register = await request(app.getHttpServer()).post('/auth/register').set('X-Platform', 'mobile').send({ name: 'João', login: 'joao', password: 'senha123' });
      const token = register.body.data.token;

      const res = await request(app.getHttpServer()).post('/auth/logout').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);

      const retry = await request(app.getHttpServer()).post('/auth/logout').set('Authorization', `Bearer ${token}`);
      expect(retry.status).toBe(401);
    });
  });
});
