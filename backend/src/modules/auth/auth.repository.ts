import { prisma } from '../../shared/database/prisma.js';

export const authRepository = {
  async findByLogin(login: string) {
    return prisma.user.findUnique({ where: { login } });
  },

  async create(data: { name: string; login: string; password: string }) {
    return prisma.user.create({ data });
  },
};
