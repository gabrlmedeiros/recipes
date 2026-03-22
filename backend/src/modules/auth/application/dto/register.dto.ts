import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Maria Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Login (nome de usuário) usado para autenticar', example: 'maria.silva' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  login!: string;

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres)', example: 's3nh4Segura' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;
}
