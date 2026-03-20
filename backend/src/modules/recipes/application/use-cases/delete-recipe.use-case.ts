import { Inject } from '@nestjs/common';
import { RecipesRepository, RECIPES_REPOSITORY } from '../../domain/repositories/recipes.repository';

export class DeleteRecipeUseCase {
  constructor(@Inject(RECIPES_REPOSITORY) private repo: RecipesRepository) {}

  async execute(id: string) {
    return this.repo.delete(id);
  }
}
