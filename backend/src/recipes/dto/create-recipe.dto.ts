import { IsInt, IsString, Min, MinLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  prepTimeMinutes!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  servings!: number;

  @IsString()
  @MinLength(10, { message: 'Modo de preparo deve ter pelo menos 10 caracteres' })
  prepMethod!: string;

  @IsString()
  @MinLength(1)
  ingredients!: string;
}
