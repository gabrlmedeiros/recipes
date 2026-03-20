import { Module } from '@nestjs/common';
import { RecipesModule } from './recipes/recipes.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, RecipesModule],
  controllers: [HealthController],
})
export class AppModule {}
