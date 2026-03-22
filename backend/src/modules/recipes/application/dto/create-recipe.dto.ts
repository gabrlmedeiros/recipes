import { IsOptional, IsString, IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeInput {
  @IsOptional()
  @IsUUID('4', { message: 'ID da categoria inválido' })
  @ApiProperty({ description: 'ID da categoria (UUID)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', required: false })
  categoryId?: string;

  @ApiProperty({ description: 'Nome da receita', example: 'Bolo de cenoura' })
  @IsString({ message: 'O nome da receita deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da receita é obrigatório' })
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O tempo de preparo deve ser um número' })
  @ApiProperty({ description: 'Tempo de preparo em minutos', example: 45, required: false })
  prepTimeMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'A quantidade de porções deve ser um número' })
  @ApiProperty({ description: 'Número de porções', example: 4, required: false })
  servings?: number;

  @IsOptional()
  @IsString({ message: 'O modo de preparo deve ser um texto' })
  @ApiProperty({ description: 'Modo de preparo', example: 'Misturar todos os ingredientes e assar por 40 minutos', required: false })
  prepMethod?: string;

  @IsOptional()
  @IsString({ message: 'Os ingredientes devem ser um texto' })
  @ApiProperty({ description: 'Lista de ingredientes', example: '3 ovos, 2 cenouras, 1 xícara de açúcar', required: false })
  ingredients?: string;
}
