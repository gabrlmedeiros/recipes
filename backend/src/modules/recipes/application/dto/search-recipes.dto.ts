import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRecipesDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  ingredient?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrepTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrepTime?: number;

  @IsOptional()
  @IsIn(['name', 'createdAt', 'prepTimeMinutes'])
  sortBy?: 'name' | 'createdAt' | 'prepTimeMinutes';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
