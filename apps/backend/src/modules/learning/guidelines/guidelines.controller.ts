import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoadmapGuidelinesService } from './guidelines.service';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { ReorderGuidelinesDto } from './dto/reorder-guidelines.dto';
import { UpdateGuidelineSettingsDto } from './dto/update-guideline-settings.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@ApiTags('Learning Guidelines')
@Controller('roadmap/guidelines')
export class RoadmapGuidelinesController {
  constructor(private readonly guidelinesService: RoadmapGuidelinesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all active guidelines for learners' })
  async findAllActive() {
    return this.guidelinesService.findAllActive();
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get learning guidelines header settings' })
  async getSettings() {
    return this.guidelinesService.getSettings();
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Update learning guidelines header settings' })
  async updateSettings(@Body() dto: UpdateGuidelineSettingsDto) {
    return this.guidelinesService.updateSettings(dto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Get all guidelines (including hidden) for admin CMS' })
  async findAllAdmin() {
    return this.guidelinesService.findAllAdmin();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Get details of a single guideline' })
  async findOne(@Param('id') id: string) {
    return this.guidelinesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Create a new learning guideline' })
  async create(@Body() dto: CreateGuidelineDto) {
    return this.guidelinesService.create(dto);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Reorder non-deleted guidelines gaplessly' })
  async reorder(@Body() dto: ReorderGuidelinesDto) {
    return this.guidelinesService.reorder(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Update an existing learning guideline' })
  async update(@Param('id') id: string, @Body() dto: UpdateGuidelineDto) {
    return this.guidelinesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @ApiOperation({ summary: 'Soft-delete a learning guideline' })
  async remove(@Param('id') id: string) {
    return this.guidelinesService.remove(id);
  }
}
