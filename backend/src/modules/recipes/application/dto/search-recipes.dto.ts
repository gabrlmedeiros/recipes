import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRecipesDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Termo de busca (nome, ingredientes)', example: 'bolo' })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filtrar por categoria (UUID)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filtrar por ingrediente', example: 'cenoura' })
  ingredient?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Número da página', example: 1 })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Tamanho da página (limit)', example: 20 })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ description: 'Tempo mínimo de preparo (minutos)', example: 10 })
  minPrepTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ description: 'Tempo máximo de preparo (minutos)', example: 60 })
  maxPrepTime?: number;

  @IsOptional()
  @IsIn(['name', 'createdAt', 'prepTimeMinutes'])
  @ApiPropertyOptional({ description: 'Campo para ordenação', example: 'name' })
  sortBy?: 'name' | 'createdAt' | 'prepTimeMinutes';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiPropertyOptional({ description: 'Direção da ordenação', example: 'asc' })
  order?: 'asc' | 'desc';
}
