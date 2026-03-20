import { Module } from '@nestjs/common';
import { RecipesModule } from './modules/recipes/recipes.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [AuthModule, RecipesModule, HealthModule],
})
export class AppModule {}
