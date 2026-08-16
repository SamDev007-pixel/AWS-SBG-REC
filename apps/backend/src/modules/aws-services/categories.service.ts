import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { MemoryCacheService } from '@/shared/cache/memory-cache.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: MemoryCacheService,
  ) {}

  async getAll(options: { includeInactive?: boolean } = {}) {
    const cacheKey = `categories:all:${!!options.includeInactive}`;
    return this.cache.getOrSet(cacheKey, async () => {
      const where: any = {
        isDeleted: false,
      };
      if (!options.includeInactive) {
        where.isActive = true;
      }

      return this.prisma.category.findMany({
        where,
        orderBy: {
          displayOrder: 'asc',
        },
      });
    }, 300);
  }

  async getById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category || category.isDeleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async getByName(name: string) {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });
    if (!category || category.isDeleted) return null;
    return category;
  }

  async getBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (!category || category.isDeleted) return null;
    return category;
  }

  async create(data: { name: string; slug: string; flag: string; displayOrder?: number; isActive?: boolean }) {
    const existingName = await this.getByName(data.name);
    if (existingName) {
      throw new ConflictException(`Category with name '${data.name}' already exists`);
    }

    const existingSlug = await this.getBySlug(data.slug);
    if (existingSlug) {
      throw new ConflictException(`Category with slug '${data.slug}' already exists`);
    }

    const created = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        flag: data.flag,
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    this.cache.invalidatePattern('categories:');
    return created;
  }

  async update(id: string, data: { name?: string; slug?: string; flag?: string; displayOrder?: number; isActive?: boolean }) {
    const existing = await this.getById(id);

    if (data.name !== undefined && data.name !== existing.name) {
      const duplicateName = await this.getByName(data.name);
      if (duplicateName) {
        throw new ConflictException(`Category with name '${data.name}' already exists`);
      }
    }

    if (data.slug !== undefined && data.slug !== existing.slug) {
      const duplicateSlug = await this.getBySlug(data.slug);
      if (duplicateSlug) {
        throw new ConflictException(`Category with slug '${data.slug}' already exists`);
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.flag !== undefined) updateData.flag = data.flag;
    if (data.displayOrder !== undefined) updateData.displayOrder = Number(data.displayOrder);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    const updated = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });
    this.cache.invalidatePattern('categories:');
    return updated;
  }

  async delete(id: string) {
    await this.getById(id);
    const res = await this.prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });
    this.cache.invalidatePattern('categories:');
    return res;
  }
}
