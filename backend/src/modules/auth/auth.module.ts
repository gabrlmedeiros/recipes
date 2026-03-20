import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaUsersRepository } from './infrastructure/repositories/prisma-users.repository';
import { USERS_REPOSITORY } from './domain/repositories/users.repository';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
    RegisterUseCase,
    LoginUseCase,
  ],
})
export class AuthModule {}
