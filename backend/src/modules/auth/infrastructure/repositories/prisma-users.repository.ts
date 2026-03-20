import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByLogin(login: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { login } });
    if (!u) return null;
    return { id: String(u.id), name: u.name, login: u.login };
  }

  async create(data: { name: string; login: string; passwordHash: string }): Promise<User> {
    const u = await this.prisma.user.create({ data: { name: data.name, login: data.login, password: data.passwordHash } });
    return { id: String(u.id), name: u.name, login: u.login };
  }

  async findByLoginWithPassword(login: string): Promise<{ user: User; passwordHash: string } | null> {
    const u = await this.prisma.user.findUnique({ where: { login } });
    if (!u) return null;
    return { user: { id: String(u.id), name: u.name, login: u.login }, passwordHash: u.password };
  }
}
