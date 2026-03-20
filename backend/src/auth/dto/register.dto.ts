import { IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  login!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;
}
