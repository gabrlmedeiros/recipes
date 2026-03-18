import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';
import { AppError } from '../../shared/utils/app-error.js';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev_secret';

function signToken(userId: number): string {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as NonNullable<jwt.SignOptions['expiresIn']>;
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn });
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByLogin(input.login);
    if (existing) {
      throw new AppError(409, 'Login já está em uso', 'LOGIN_TAKEN');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await authRepository.create({
      name: input.name,
      login: input.login,
      password: hashedPassword,
    });

    return {
      token: signToken(user.id),
      user: { id: user.id, name: user.name, login: user.login },
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByLogin(input.login);
    const valid = user ? await bcrypt.compare(input.password, user.password) : false;

    if (!user || !valid) {
      throw new AppError(401, 'Login ou senha inválidos', 'INVALID_CREDENTIALS');
    }

    return {
      token: signToken(user.id),
      user: { id: user.id, name: user.name, login: user.login },
    };
  },
};
