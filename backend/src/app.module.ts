import { Module } from '@nestjs/common';
import { RecipesModule } from './modules/recipes/recipes.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrintsModule } from './modules/prints/prints.module';

@Module({
  imports: [AuthModule, RecipesModule, PrintsModule, HealthModule],
})
export class AppModule {}
