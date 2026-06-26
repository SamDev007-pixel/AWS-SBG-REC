import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RoadmapUploadsController } from './uploads.controller';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [MulterModule.register(), AuthModule],
  controllers: [RoadmapUploadsController],
})
export class RoadmapUploadsModule {}
