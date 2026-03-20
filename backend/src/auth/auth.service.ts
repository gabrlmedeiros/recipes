import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev_secret';

function signToken(userId: string | number) {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'];
  const sub = String(userId);
  return jwt.sign({ sub }, JWT_SECRET, { expiresIn });
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(input: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { login: input.login } });
    if (existing) {
      throw new HttpException({ message: 'Login já está em uso', code: 'LOGIN_TAKEN' }, 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: { name: input.name, login: input.login, password: hashedPassword },
    });

    return {
      token: signToken(String(user.id)),
      user: { id: user.id, name: user.name, login: user.login },
    };
  }

  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { login: input.login } });
    const valid = user ? await bcrypt.compare(input.password, user.password) : false;

    if (!user || !valid) {
      throw new HttpException({ message: 'Login ou senha inválidos', code: 'INVALID_CREDENTIALS' }, 401);
    }

    return {
      token: signToken(String(user.id)),
      user: { id: user.id, name: user.name, login: user.login },
    };
  }
}
