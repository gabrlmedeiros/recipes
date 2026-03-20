import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipeOwnerGuard } from './recipe-owner.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private service: RecipesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    const p = parseInt(page as any, 10) || 1;
    const l = parseInt(limit as any, 10) || 20;
    const userId = req.user?.id as string | undefined;
    return { data: await this.service.list(p, l, userId), error: null };
  }

  @Get('categories')
  async categories() {
    const cats = await this.service.getCategories();
    return { data: cats, error: null };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  async get(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const recipe = req.recipe ?? (await this.service.get(id));
    return { data: recipe ?? null, error: null };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() body: CreateRecipeDto) {
    const userId = req.user?.id as string;
    const recipe = await this.service.create(body, userId);
    return { data: recipe, error: null };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Partial<CreateRecipeDto>) {
    const recipe = await this.service.update(id, body);
    return { data: recipe, error: null };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RecipeOwnerGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.delete(id);
    return { data: null, error: null };
  }
}
