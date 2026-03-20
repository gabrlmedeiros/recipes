import { JwtAuthGuard } from '../application/guards/jwt-auth.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));
import * as jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../token-blacklist';

function makeContext(headers: any = {}, cookies: any = {}) {
  return ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, cookies }),
    }),
  } as unknown) as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  afterEach(() => jest.restoreAllMocks());

  it('nega quando token ausente', () => {
    const guard = new JwtAuthGuard();
    const ctx = makeContext({}, {});
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('nega quando token está na blacklist', () => {
    const guard = new JwtAuthGuard();
    const ctx = makeContext({ authorization: 'Bearer bad' }, {});
    jest.spyOn(tokenBlacklist, 'has').mockReturnValue(true);
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('nega quando token inválido', () => {
    const guard = new JwtAuthGuard();
    const ctx = makeContext({ authorization: 'Bearer bad' }, {});
    jest.spyOn(tokenBlacklist, 'has').mockReturnValue(false);
    (jwt as any).verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('autoriza quando token válido no header', () => {
    const guard = new JwtAuthGuard();
    const ctx = makeContext({ authorization: 'Bearer good' }, {});
    jest.spyOn(tokenBlacklist, 'has').mockReturnValue(false);
    (jwt as any).verify.mockReturnValue({ sub: 'u1' } as any);
    const res = guard.canActivate(ctx);
    expect(res).toBe(true);
  });

  it('autoriza quando token válido no cookie', () => {
    const guard = new JwtAuthGuard();
    const ctx = makeContext({}, { token: 'cookie-token' });
    jest.spyOn(tokenBlacklist, 'has').mockReturnValue(false);
    (jwt as any).verify.mockReturnValue({ sub: 'u2' } as any);
    const res = guard.canActivate(ctx);
    expect(res).toBe(true);
  });
});
