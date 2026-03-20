import { RegisterUseCase } from '../application/use-cases/register.use-case';

jest.mock('bcrypt', () => ({ hash: jest.fn(async (pw: string) => `hashed-${pw}`) }));
jest.mock('../utils/jwt', () => ({ signToken: jest.fn(() => 'mock-token') }));

describe('RegisterUseCase', () => {
  it('lança erro quando o login já existe', async () => {
    const usersRepo = { findByLogin: jest.fn().mockResolvedValue({ id: 'u1' }), findByLoginWithPassword: jest.fn(), create: jest.fn() };
    const uc = new RegisterUseCase(usersRepo);
    await expect(uc.execute({ name: 'A', login: 'exists', password: 'p' })).rejects.toMatchObject({ status: 409 });
  });

  it('cria usuário e retorna token', async () => {
    const usersRepo = {
      findByLogin: jest.fn().mockResolvedValue(null),
      findByLoginWithPassword: jest.fn(),
      create: jest.fn().mockImplementation(async (data: any) => ({ id: 'u2', ...data })),
    };
    const uc = new RegisterUseCase(usersRepo);
    const out = await uc.execute({ name: 'New', login: 'new', password: 'pw' });
    expect(usersRepo.create).toHaveBeenCalled();
    expect(out).toHaveProperty('token', 'mock-token');
    expect(out.user).toMatchObject({ id: 'u2', name: 'New', login: 'new' });
  });
});
