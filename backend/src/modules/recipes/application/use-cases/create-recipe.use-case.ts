import { Inject, BadRequestException } from '@nestjs/common';
import { RecipesRepository, RECIPES_REPOSITORY } from '../../domain/repositories/recipes.repository';
import { CreateRecipeInput } from '../dto/create-recipe.dto';

export class CreateRecipeUseCase {
  constructor(@Inject(RECIPES_REPOSITORY) private repo: RecipesRepository) {}

  async execute(input: CreateRecipeInput, userId: string) {
    if (!input || !input.name) {
      throw new BadRequestException({ message: 'O nome da receita é obrigatório', code: 'BAD_REQUEST' });
    }
    const data = {
      userId,
      categoryId: input.categoryId,
      name: input.name,
      prepTimeMinutes: input.prepTimeMinutes ?? 0,
      servings: input.servings ?? 1,
      prepMethod: input.prepMethod ?? '',
      ingredients: input.ingredients ?? '',
    };
    return this.repo.create(data);
  }
}
