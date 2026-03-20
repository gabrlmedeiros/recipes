import { Inject, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository, USERS_REPOSITORY } from '../../domain/repositories/users.repository';
import { LoginDto } from '../dto/login.dto';
import { signToken } from '../../utils/jwt';

export class LoginUseCase {
  constructor(@Inject(USERS_REPOSITORY) private usersRepo: UsersRepository) {}

  async execute(input: LoginDto) {
    const row = await this.usersRepo.findByLoginWithPassword(input.login);
    const valid = row ? await bcrypt.compare(input.password, row.passwordHash) : false;
    if (!row || !valid) {
      throw new HttpException({ message: 'Login ou senha inválidos', code: 'INVALID_CREDENTIALS' }, 401);
    }
    return { token: signToken(String(row.user.id)), user: row.user };
  }
}
