import { Inject, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository, USERS_REPOSITORY } from '../../domain/repositories/users.repository';
import { RegisterDto } from '../dto/register.dto';
import { signToken } from '../../utils/jwt';

export class RegisterUseCase {
  constructor(@Inject(USERS_REPOSITORY) private usersRepo: UsersRepository) {}

  async execute(input: RegisterDto) {
    const existing = await this.usersRepo.findByLogin(input.login);
    if (existing) {
      throw new HttpException({ message: 'Login já está em uso', code: 'LOGIN_TAKEN' }, 409);
    }
    const hash = await bcrypt.hash(input.password, 10);
    const user = await this.usersRepo.create({ name: input.name, login: input.login, passwordHash: hash });
    return { token: signToken(String(user.id)), user };
  }
}
