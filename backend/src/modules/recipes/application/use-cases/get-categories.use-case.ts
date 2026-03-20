import { Inject } from '@nestjs/common';
import { RecipesRepository, RECIPES_REPOSITORY } from '../../domain/repositories/recipes.repository';

export class GetCategoriesUseCase {
  constructor(@Inject(RECIPES_REPOSITORY) private repo: RecipesRepository) {}

  async execute() {
    return this.repo.getCategories();
  }
}
