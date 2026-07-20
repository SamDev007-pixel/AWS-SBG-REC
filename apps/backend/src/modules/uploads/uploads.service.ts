import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';

@Injectable()
export class RoadmapUploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    return this.cloudinaryService.uploadFile(file, 'aws-roadmap/slides');
  }
}
