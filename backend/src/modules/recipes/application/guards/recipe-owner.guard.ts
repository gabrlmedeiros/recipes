import { CanActivate, ExecutionContext, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class RecipeOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const id = req.params?.id as string | undefined;

    if (!user || !user.id) {
      throw new HttpException({ message: 'Usuário não autenticado' }, 401);
    }

    if (!id) {
      throw new HttpException({ message: 'Recurso não encontrado' }, 404);
    }

    const recipe = await this.prisma.recipe.findUnique({ where: { id: id as any }, include: { category: true, user: true } });
    if (!recipe) {
      throw new HttpException({ message: 'Receita não encontrada' }, 404);
    }

    if (String(recipe.userId) !== String(user.id)) {
      throw new HttpException({ message: 'Acesso negado' }, 403);
    }

    req.recipe = recipe;
    return true;
  }
}
