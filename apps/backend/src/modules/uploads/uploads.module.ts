import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RoadmapUploadsController } from './uploads.controller';
import { RoadmapUploadsService } from './uploads.service';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    MulterModule.register(),
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [RoadmapUploadsController],
  providers: [RoadmapUploadsService],
  exports: [RoadmapUploadsService],
})
export class RoadmapUploadsModule {}
