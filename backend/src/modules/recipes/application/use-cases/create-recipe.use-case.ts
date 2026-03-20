import { Inject } from '@nestjs/common';
import { RecipesRepository, RECIPES_REPOSITORY } from '../../domain/repositories/recipes.repository';
import { CreateRecipeInput } from '../dto/create-recipe.dto';

export class CreateRecipeUseCase {
  constructor(@Inject(RECIPES_REPOSITORY) private repo: RecipesRepository) {}

  async execute(input: CreateRecipeInput, userId: string) {
    return this.repo.create({ ...input, userId });
  }
}
