import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, Request, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateRecipeInput } from './application/dto/create-recipe.dto';
import { RecipeOwnerGuard } from './application/guards/recipe-owner.guard';
import { ListRecipesUseCase } from './application/use-cases/list-recipes.use-case';
import { GetRecipeUseCase } from './application/use-cases/get-recipe.use-case';
import { CreateRecipeUseCase } from './application/use-cases/create-recipe.use-case';
import { UpdateRecipeUseCase } from './application/use-cases/update-recipe.use-case';
import { DeleteRecipeUseCase } from './application/use-cases/delete-recipe.use-case';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';
import { JwtAuthGuard } from '../auth/application/guards/jwt-auth.guard';
import { SearchRecipesDto } from './application/dto/search-recipes.dto';

@ApiTags('Receitas')
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar receitas do usuário com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de receitas retornada' })
  async list(@Request() req: any, @Query() query: SearchRecipesDto) {
    const p = Number(query.page ?? 1) || 1;
    const l = Number(query.limit ?? 20) || 20;
    const userId = req.user?.id as string | undefined;
    const filters = {
      q: query.q,
      categoryId: query.categoryId,
      ingredient: query.ingredient,
      minPrepTime: query.minPrepTime,
      maxPrepTime: query.maxPrepTime,
      sortBy: query.sortBy,
      order: query.order,
    };

    try {
      const data = await this.listUseCase.execute(p, l, userId, filters);
      return { data, error: null };
    } catch (err: unknown) {
      console.error('Error in RecipesController.list:', err);
      let message = 'Falha na busca';
      if (err && typeof err === 'object') {
        const maybe = err as { message?: unknown };
        if (typeof maybe.message === 'string') message = maybe.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      throw new HttpException({ message, code: 'INTERNAL_ERROR' }, 500);
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias disponíveis' })
  @ApiResponse({ status: 200, description: 'Categorias retornadas' })
  async categories() {
    const cats = await this.categoriesUseCase.execute();
    return { data: cats, error: null };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter uma receita pelo ID' })
  @ApiResponse({ status: 200, description: 'Receita retornada' })
  async get(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const recipe = req.recipe ?? (await this.getUseCase.execute(id));
    return { data: recipe ?? null, error: null };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar uma nova receita' })
  @ApiResponse({ status: 201, description: 'Receita criada com sucesso' })
  async create(@Request() req: any, @Body() body: CreateRecipeInput) {
    const userId = req.user?.id as string;
    const recipe = await this.createUseCase.execute(body, userId);
    return { data: recipe, error: null };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar uma receita existente' })
  @ApiResponse({ status: 200, description: 'Receita atualizada' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Partial<CreateRecipeInput>) {
    const recipe = await this.updateUseCase.execute(id, body);
    return { data: recipe, error: null };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover uma receita' })
  @ApiResponse({ status: 200, description: 'Receita removida' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUseCase.execute(id);
    return { data: null, error: null };
  }

}
