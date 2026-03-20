import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { RecipesRepository, Paginated, CreateRecipeData } from '../../domain/repositories/recipes.repository';
import { Recipe } from '../../domain/entities/recipe.entity';

@Injectable()
export class PrismaRecipesRepository implements RecipesRepository {
  constructor(private prisma: PrismaService) {}

  private toDomain(r: any): Recipe {
    if (!r) return r;
    return {
      id: String(r.id),
      name: r.name,
      prepTimeMinutes: r.prepTimeMinutes,
      servings: r.servings,
      prepMethod: r.prepMethod,
      ingredients: r.ingredients,
      createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
      updatedAt: r.updatedAt?.toISOString?.() ?? String(r.updatedAt),
      category: r.category ? { id: String(r.category.id), name: r.category.name } : null,
      user: r.user ? { id: String(r.user.id), name: r.user.name, login: r.user.login } : null,
    };
  }

  async list(page = 1, limit = 20, userId?: string, filters?: any): Promise<Paginated<Recipe>> {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (userId) where.userId = userId;

    if (filters) {
      const { q, categoryId, ingredient, minPrepTime, maxPrepTime } = filters;
      if (categoryId) where.categoryId = categoryId;
      const minPrep = minPrepTime !== undefined && minPrepTime !== null ? Number(minPrepTime) : undefined;
      const maxPrep = maxPrepTime !== undefined && maxPrepTime !== null ? Number(maxPrepTime) : undefined;
      if (minPrep !== undefined || maxPrep !== undefined) {
        where.prepTimeMinutes = {};
        if (minPrep !== undefined && !Number.isNaN(minPrep)) where.prepTimeMinutes.gte = minPrep;
        if (maxPrep !== undefined && !Number.isNaN(maxPrep)) where.prepTimeMinutes.lte = maxPrep;
      }
      if (ingredient) {
        where.ingredients = { contains: String(ingredient) };
      }
      if (q) {
        where.OR = [
          { name: { contains: String(q) } },
          { ingredients: { contains: String(q) } },
          { prepMethod: { contains: String(q) } },
        ];
      }
    }

    const orderBy: any = filters && filters.sortBy ? { [filters.sortBy]: (filters.order || 'asc') } : { id: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.recipe.findMany({ where, skip, take: limit, include: { category: true }, orderBy }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      items: items.map(this.toDomain.bind(this)),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getById(id: string): Promise<Recipe | null> {
    const r = await this.prisma.recipe.findUnique({ where: { id }, include: { category: true, user: true } });
    return this.toDomain(r);
  }

  async create(input: CreateRecipeData): Promise<Recipe> {
    if (!input || !input.name) {
      throw new HttpException({ message: 'O nome da receita é obrigatório', code: 'BAD_REQUEST' }, HttpStatus.BAD_REQUEST);
    }
    const r = await this.prisma.recipe.create({
      data: {
        userId: input.userId,
        categoryId: input.categoryId,
        name: input.name,
        prepTimeMinutes: input.prepTimeMinutes,
        servings: input.servings,
        prepMethod: input.prepMethod,
        ingredients: input.ingredients,
      },
      include: { category: true },
    });
    return this.toDomain(r);
  }

  async update(id: string, input: Partial<Recipe>): Promise<Recipe> {
    const data: any = {};
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) data[k] = v;
    }
    const r = await this.prisma.recipe.update({ where: { id }, data, include: { category: true } });
    return this.toDomain(r);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recipe.delete({ where: { id } });
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r: any) => ({ id: String(r.id), name: r.name }));
  }
}
