import { Injectable } from '@nestjs/common';
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

  async list(page = 1, limit = 20, userId?: string): Promise<Paginated<Recipe>> {
    const skip = (page - 1) * limit;
    const where = userId ? { userId: userId as any } : undefined;
    const [items, total] = await Promise.all([
      this.prisma.recipe.findMany({ where, skip, take: limit, include: { category: true }, orderBy: { id: 'desc' } }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      items: items.map(this.toDomain.bind(this)),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getById(id: string): Promise<Recipe | null> {
    const r = await this.prisma.recipe.findUnique({ where: { id: id as any }, include: { category: true, user: true } });
    return this.toDomain(r as any);
  }

  async create(input: CreateRecipeData): Promise<Recipe> {
    const r = await this.prisma.recipe.create({
      data: {
        userId: input.userId as any,
        categoryId: input.categoryId as any,
        name: input.name,
        prepTimeMinutes: input.prepTimeMinutes,
        servings: input.servings,
        prepMethod: input.prepMethod,
        ingredients: input.ingredients,
      },
      include: { category: true },
    });
    return this.toDomain(r as any);
  }

  async update(id: string, input: Partial<Recipe>): Promise<Recipe> {
    const data: any = {};
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) data[k] = v;
    }
    const r = await this.prisma.recipe.update({ where: { id: id as any }, data, include: { category: true } });
    return this.toDomain(r as any);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recipe.delete({ where: { id: id as any } });
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r: any) => ({ id: String(r.id), name: r.name }));
  }
}
