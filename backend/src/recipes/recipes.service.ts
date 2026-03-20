import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async list(page = 1, limit = 20, userId?: string) {
    const skip = (page - 1) * limit;
    const where = userId ? { userId: userId as any } : undefined;
    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async get(id: string) {
    return this.prisma.recipe.findUnique({ where: { id: id as any }, include: { category: true, user: true } });
  }

  async create(input: CreateRecipeDto, userId: string) {
    const recipe = await this.prisma.recipe.create({
      data: {
        userId: userId as any,
        categoryId: input.categoryId as any,
        name: input.name,
        prepTimeMinutes: input.prepTimeMinutes,
        servings: input.servings,
        prepMethod: input.prepMethod,
        ingredients: input.ingredients,
      },
      include: { category: true },
    });

    return recipe;
  }

  async update(id: string, input: Partial<CreateRecipeDto>) {
    const data: any = { ...input };
    return this.prisma.recipe.update({ where: { id: id as any }, data, include: { category: true } });
  }

  async delete(id: string) {
    await this.prisma.recipe.delete({ where: { id: id as any } });
    return;
  }

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }
}
