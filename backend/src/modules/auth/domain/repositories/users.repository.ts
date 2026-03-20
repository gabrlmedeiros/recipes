import { User } from '../entities/user.entity';

export interface UsersRepository {
  findByLogin(login: string): Promise<User | null>;
  findByLoginWithPassword(login: string): Promise<{ user: User; passwordHash: string } | null>;
  create(data: { name: string; login: string; passwordHash: string }): Promise<User>;
}

export const USERS_REPOSITORY = 'USERS_REPOSITORY';
