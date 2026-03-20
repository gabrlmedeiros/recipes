import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRegisterUseCase: Partial<Record<'execute', jest.Mock>>;
  let mockLoginUseCase: Partial<Record<'execute', jest.Mock>>;

  beforeEach(async () => {
    mockRegisterUseCase = { execute: jest.fn() };
    mockLoginUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('register lança BadRequest quando body inválido', async () => {
    const res: any = { cookie: jest.fn() };
    await expect(controller.register(undefined as any, { headers: {} } as any, res)).rejects.toThrow(BadRequestException);
  });

  it('register retorna dado completo para mobile sem setar cookie', async () => {
    const result = { token: 'tok', user: { id: 1, name: 'A' } };
    (mockRegisterUseCase.execute as jest.Mock).mockResolvedValue(result);

    const req: any = { headers: { 'x-platform': 'mobile' } };
    const res: any = { cookie: jest.fn() };

    const out = await controller.register({ login: 'u', password: 'p' } as any, req, res);

    expect(mockRegisterUseCase.execute).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
    expect(out).toEqual({ data: result, error: null });
  });

  it('register seta cookie e retorna apenas user para web', async () => {
    const result = { token: 'tok', user: { id: 2, name: 'B' } };
    (mockRegisterUseCase.execute as jest.Mock).mockResolvedValue(result);

    const req: any = { headers: {} };
    const res: any = { cookie: jest.fn() };

    const out = await controller.register({ login: 'u', password: 'p' } as any, req, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 'tok', expect.any(Object));
    expect(out).toEqual({ data: result.user, error: null });
  });

  it('login lança BadRequest quando body inválido', async () => {
    const res: any = { cookie: jest.fn() };
    await expect(controller.login(undefined as any, { headers: {} } as any, res)).rejects.toThrow(BadRequestException);
  });

  it('login retorna token para mobile sem setar cookie', async () => {
    const result = { token: 't', user: { id: 3, name: 'C' } };
    (mockLoginUseCase.execute as jest.Mock).mockResolvedValue(result);

    const req: any = { headers: { 'x-platform': 'mobile' } };
    const res: any = { cookie: jest.fn() };

    const out = await controller.login({ login: 'u', password: 'p' } as any, req, res);

    expect(mockLoginUseCase.execute).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
    expect(out).toEqual({ data: result, error: null });
  });

  it('login seta cookie e retorna user para web', async () => {
    const result = { token: 't2', user: { id: 4, name: 'D' } };
    (mockLoginUseCase.execute as jest.Mock).mockResolvedValue(result);

    const req: any = { headers: {} };
    const res: any = { cookie: jest.fn() };

    const out = await controller.login({ login: 'u', password: 'p' } as any, req, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 't2', expect.any(Object));
    expect(out).toEqual({ data: result.user, error: null });
  });

  it('logout limpa cookie e retorna sucesso', async () => {
    const req: any = { cookies: { token: 'abc' } };
    const res: any = { clearCookie: jest.fn() };

    const out = await controller.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(out).toEqual({ data: { success: true }, error: null });
  });
});
