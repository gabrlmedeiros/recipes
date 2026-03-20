import { LoginUseCase } from '../application/use-cases/login.use-case';

jest.mock('bcrypt', () => ({ compare: jest.fn(async (pw: string, hash: string) => hash === `hashed-${pw}`) }));
jest.mock('../utils/jwt', () => ({ signToken: jest.fn(() => 'mock-token') }));

describe('LoginUseCase', () => {
  it('lança erro quando credenciais inválidas', async () => {
    const usersRepo = {
      findByLogin: jest.fn(),
      findByLoginWithPassword: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    const uc = new LoginUseCase(usersRepo);
    await expect(uc.execute({ login: 'x', password: 'p' })).rejects.toMatchObject({ status: 401 });
  });

  it('retorna token e usuário em caso de sucesso', async () => {
    const usersRepo = {
      findByLogin: jest.fn(),
      findByLoginWithPassword: jest.fn().mockResolvedValue({ passwordHash: 'hashed-pw', user: { id: 'u1', name: 'N' } }),
      create: jest.fn(),
    };
    const uc = new LoginUseCase(usersRepo);
    const out = await uc.execute({ login: 'u', password: 'pw' });
    expect(out).toHaveProperty('token', 'mock-token');
    expect(out.user).toMatchObject({ id: 'u1', name: 'N' });
  });
});
