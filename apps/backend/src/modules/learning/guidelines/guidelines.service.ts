import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { GuidelineIcon } from '@prisma/client';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { ReorderGuidelinesDto } from './dto/reorder-guidelines.dto';
import { UpdateGuidelineSettingsDto } from './dto/update-guideline-settings.dto';

@Injectable()
export class RoadmapGuidelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.learningGuideline.findMany({
      where: {
        isDeleted: false,
        isActive: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        prominent: true,
        prominentColor: true,
        orderIndex: true,
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.learningGuideline.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const guideline = await this.prisma.learningGuideline.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
    if (!guideline) {
      throw new NotFoundException(`Learning guideline with ID "${id}" not found`);
    }
    return guideline;
  }

  async create(dto: CreateGuidelineDto) {
    // 1. Check title uniqueness
    const existing = await this.prisma.learningGuideline.findFirst({
      where: {
        title: { equals: dto.title, mode: 'insensitive' },
        isDeleted: false,
      },
    });
    if (existing) {
      throw new ConflictException(`A learning guideline with the title "${dto.title}" already exists.`);
    }

    // Get current count to set orderIndex gaplessly at the end
    const count = await this.prisma.learningGuideline.count({
      where: { isDeleted: false },
    });

    return this.prisma.$transaction(async (tx) => {
      // 2. Enforce single prominent guideline constraint
      if (dto.prominent === true) {
        await tx.learningGuideline.updateMany({
          where: { isDeleted: false, prominent: true },
          data: { prominent: false, prominentColor: null },
        });
      }

      return tx.learningGuideline.create({
        data: {
          title: dto.title,
          description: dto.description ?? null,
          icon: dto.icon,
          prominent: dto.prominent ?? false,
          prominentColor: dto.prominent ? (dto.prominentColor ?? null) : null,
          isActive: dto.isActive ?? true,
          orderIndex: count,
        },
      });
    });
  }

  async update(id: string, dto: UpdateGuidelineDto) {
    const existing = await this.findOne(id);

    // 1. Check title uniqueness if title is updated
    if (dto.title && dto.title.toLowerCase() !== existing.title.toLowerCase()) {
      const duplicate = await this.prisma.learningGuideline.findFirst({
        where: {
          title: { equals: dto.title, mode: 'insensitive' },
          isDeleted: false,
        },
      });
      if (duplicate) {
        throw new ConflictException(`A learning guideline with the title "${dto.title}" already exists.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 2. Enforce single prominent guideline constraint
      if (dto.prominent === true) {
        await tx.learningGuideline.updateMany({
          where: {
            isDeleted: false,
            prominent: true,
            id: { not: id },
          },
          data: { prominent: false, prominentColor: null },
        });
      }

      // If we are turning off prominent, make sure prominentColor is cleared
      const updateData: any = { ...dto };
      if (dto.prominent === false) {
        updateData.prominentColor = null;
      }

      return tx.learningGuideline.update({
        where: { id },
        data: updateData,
      });
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Soft delete
      const deleted = await tx.learningGuideline.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          prominent: false,
          prominentColor: null,
        },
      });

      // Consolidation: Shift all subsequent guidelines down by 1
      await tx.learningGuideline.updateMany({
        where: {
          isDeleted: false,
          orderIndex: { gt: existing.orderIndex },
        },
        data: {
          orderIndex: { decrement: 1 },
        },
      });

      return deleted;
    });
  }

  async reorder(dto: ReorderGuidelinesDto) {
    const { ids } = dto;

    // Verify all IDs are valid and active/non-deleted
    const count = await this.prisma.learningGuideline.count({
      where: {
        id: { in: ids },
        isDeleted: false,
      },
    });

    if (count !== ids.length) {
      throw new BadRequestException('Invalid guideline IDs provided for reordering');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update each item's orderIndex transactionally
      for (let i = 0; i < ids.length; i++) {
        await tx.learningGuideline.update({
          where: { id: ids[i] },
          data: { orderIndex: i },
        });
      }
      return { success: true };
    });
  }

  async getSettings() {
    const settings = await this.prisma.learningGuidelineSettings.findFirst();
    if (!settings) {
      return {
        headerIcon: 'LIGHTBULB' as GuidelineIcon,
        headerTitle: 'GUIDELINES',
        headerDescription: 'Platform learning rules and progression guidelines',
      };
    }
    return settings;
  }

  async updateSettings(dto: UpdateGuidelineSettingsDto) {
    const existing = await this.prisma.learningGuidelineSettings.findFirst();
    if (existing) {
      return this.prisma.learningGuidelineSettings.update({
        where: { id: existing.id },
        data: dto,
      });
    } else {
      return this.prisma.learningGuidelineSettings.create({
        data: {
          headerIcon: dto.headerIcon ?? 'LIGHTBULB',
          headerTitle: dto.headerTitle ?? 'GUIDELINES',
          headerDescription: dto.headerDescription ?? 'Platform learning rules and progression guidelines',
        },
      });
    }
  }
}
