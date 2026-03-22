import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Login (nome de usuário)', example: 'maria.silva' })
  @IsString()
  @MinLength(1)
  login!: string;

  @ApiProperty({ description: 'Senha do usuário', example: 's3nh4Segura' })
  @IsString()
  @MinLength(1)
  password!: string;
}
