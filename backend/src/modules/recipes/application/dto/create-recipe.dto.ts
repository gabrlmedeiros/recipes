import { IsOptional, IsString, IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeInput {
  @IsOptional()
  @IsUUID('4', { message: 'ID da categoria inválido' })
  categoryId?: string;

  @IsString({ message: 'O nome da receita deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da receita é obrigatório' })
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O tempo de preparo deve ser um número' })
  prepTimeMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'A quantidade de porções deve ser um número' })
  servings?: number;

  @IsOptional()
  @IsString({ message: 'O modo de preparo deve ser um texto' })
  prepMethod?: string;

  @IsOptional()
  @IsString({ message: 'Os ingredientes devem ser um texto' })
  ingredients?: string;
}
