import { Module } from '@nestjs/common';
import { RoadmapLearningService } from './learning.service';
import { RoadmapLearningController } from './learning.controller';
import { RoadmapGuidelinesService } from './guidelines/guidelines.service';
import { RoadmapGuidelinesController } from './guidelines/guidelines.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RoadmapProgressModule } from '@/modules/progress/progress.module';

@Module({
  imports: [PrismaModule, AuthModule, RoadmapProgressModule],
  controllers: [RoadmapLearningController, RoadmapGuidelinesController],
  providers: [RoadmapLearningService, RoadmapGuidelinesService],
})
export class RoadmapLearningModule {}

