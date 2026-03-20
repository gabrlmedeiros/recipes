import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Partial<PrismaService>;

  const mockUser = {
    id: 1,
    name: 'João Silva',
    login: 'joaosilva',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      } as any,
    } as Partial<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registro', () => {
    it('lança 409 quando o login já está em uso', async () => {
      (prisma.user!.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.register({ name: 'Outro', login: 'joaosilva', password: '123456' } as any),
      ).rejects.toThrow(HttpException);

      await expect(
        service.register({ name: 'Outro', login: 'joaosilva', password: '123456' } as any),
      ).rejects.toMatchObject({ status: 409, response: expect.objectContaining({ code: 'LOGIN_TAKEN' }) });
    });

    it('cria usuário e retorna token + dados do usuário quando o login está disponível', async () => {
      (prisma.user!.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user!.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.register({ name: 'João Silva', login: 'joaosilva', password: 'senha123' } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user!.create).toHaveBeenCalledWith({
        data: { name: 'João Silva', login: 'joaosilva', password: 'hashed-password' },
      });
      expect(result).toMatchObject({
        token: 'mock-jwt-token',
        user: { id: 1, name: 'João Silva', login: 'joaosilva' },
      });
    });
  });

  describe('login', () => {
    it('lança 401 quando o usuário não existe', async () => {
      (prisma.user!.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ login: 'naoexiste', password: 'senha123' } as any))
        .rejects.toMatchObject({ status: 401, response: expect.objectContaining({ code: 'INVALID_CREDENTIALS' }) });
    });

    it('lança 401 quando a senha está incorreta', async () => {
      (prisma.user!.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ login: 'joaosilva', password: 'senha-errada' } as any))
        .rejects.toMatchObject({ status: 401, response: expect.objectContaining({ code: 'INVALID_CREDENTIALS' }) });
    });

    it('retorna token + usuário quando as credenciais são válidas', async () => {
      (prisma.user!.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ login: 'joaosilva', password: 'senha123' } as any);

      expect(result).toMatchObject({
        token: 'mock-jwt-token',
        user: { id: 1, name: 'João Silva', login: 'joaosilva' },
      });
    });
  });
});
