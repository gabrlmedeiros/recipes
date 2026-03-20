import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import { CreateRecipeInput } from './application/dto/create-recipe.dto';
import { RecipeOwnerGuard } from './application/guards/recipe-owner.guard';
import { ListRecipesUseCase } from './application/use-cases/list-recipes.use-case';
import { GetRecipeUseCase } from './application/use-cases/get-recipe.use-case';
import { CreateRecipeUseCase } from './application/use-cases/create-recipe.use-case';
import { UpdateRecipeUseCase } from './application/use-cases/update-recipe.use-case';
import { DeleteRecipeUseCase } from './application/use-cases/delete-recipe.use-case';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';
import { JwtAuthGuard } from '../auth/application/guards/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(
    private listUseCase: ListRecipesUseCase,
    private getUseCase: GetRecipeUseCase,
    private createUseCase: CreateRecipeUseCase,
    private updateUseCase: UpdateRecipeUseCase,
    private deleteUseCase: DeleteRecipeUseCase,
    private categoriesUseCase: GetCategoriesUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    const p = parseInt(page as any, 10) || 1;
    const l = parseInt(limit as any, 10) || 20;
    const userId = req.user?.id as string | undefined;
    return { data: await this.listUseCase.execute(p, l, userId), error: null };
  }

  @Get('categories')
  async categories() {
    const cats = await this.categoriesUseCase.execute();
    return { data: cats, error: null };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  async get(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const recipe = req.recipe ?? (await this.getUseCase.execute(id));
    return { data: recipe ?? null, error: null };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() body: CreateRecipeInput) {
    const userId = req.user?.id as string;
    const recipe = await this.createUseCase.execute(body, userId);
    return { data: recipe, error: null };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Partial<CreateRecipeInput>) {
    const recipe = await this.updateUseCase.execute(id, body);
    return { data: recipe, error: null };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUseCase.execute(id);
    return { data: null, error: null };
  }
}
