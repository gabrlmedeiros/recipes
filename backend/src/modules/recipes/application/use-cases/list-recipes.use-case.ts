import { Inject } from '@nestjs/common';
import { RecipesRepository, RECIPES_REPOSITORY, RecipesFilters } from '../../domain/repositories/recipes.repository';

export class ListRecipesUseCase {
  constructor(@Inject(RECIPES_REPOSITORY) private repo: RecipesRepository) {}

  async execute(page = 1, limit = 20, userId?: string, filters?: RecipesFilters) {
    return this.repo.list(page, limit, userId, filters);
  }
}
