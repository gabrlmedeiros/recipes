import { CanActivate, ExecutionContext, Injectable, HttpException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../../token-blacklist';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev_secret';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const header = req.headers?.authorization as string | undefined;
    const cookieToken = req.cookies?.token as string | undefined;
    const token = cookieToken ?? (header && header.startsWith('Bearer ') ? header.slice(7) : undefined);

    if (!token) {
      throw new HttpException({ message: 'Token não fornecido', code: 'MISSING_TOKEN' }, 401);
    }

    if (tokenBlacklist.has(token)) {
      throw new HttpException({ message: 'Token inválido', code: 'INVALID_TOKEN' }, 401);
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      req.user = { id: String(payload.sub), token };
      return true;
    } catch {
      throw new HttpException({ message: 'Token inválido ou expirado', code: 'INVALID_TOKEN' }, 401);
    }
  }
}
