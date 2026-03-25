import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RecipesController } from './recipes.controller';
import { RecipeOwnerGuard } from './application/guards/recipe-owner.guard';
import { PrismaRecipesRepository } from './infrastructure/repositories/prisma-recipes.repository';
import { RECIPES_REPOSITORY } from './domain/repositories/recipes.repository';
import { ListRecipesUseCase } from './application/use-cases/list-recipes.use-case';
import { GetRecipeUseCase } from './application/use-cases/get-recipe.use-case';
import { CreateRecipeUseCase } from './application/use-cases/create-recipe.use-case';
import { UpdateRecipeUseCase } from './application/use-cases/update-recipe.use-case';
import { DeleteRecipeUseCase } from './application/use-cases/delete-recipe.use-case';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [RecipesController],
  providers: [
    // repository binding
    { provide: RECIPES_REPOSITORY, useClass: PrismaRecipesRepository },
    // use-cases
    ListRecipesUseCase,
    GetRecipeUseCase,
    CreateRecipeUseCase,
    UpdateRecipeUseCase,
    DeleteRecipeUseCase,
    GetCategoriesUseCase,
    // guards
    RecipeOwnerGuard,
  ],
})
export class RecipesModule {}
