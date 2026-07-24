import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HomepageService } from './homepage.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  // ── PUBLIC GET ENDPOINTS ──────────────────────────────────────────────────

  @Get('hero')
  getHero() {
    return this.homepageService.getHero();
  }

  @Get('coordinator')
  getCoordinator() {
    return this.homepageService.getCoordinator();
  }

  @Get('journeys')
  getJourneys() {
    return this.homepageService.getJourneys();
  }

  @Get('testimonials')
  getTestimonials() {
    return this.homepageService.getTestimonials();
  }

  @Get('team')
  getTeam() {
    return this.homepageService.getTeam();
  }

  // ── CORE-PROTECTED WRITE ENDPOINTS ────────────────────────────────────────

  @Put('hero')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  updateHero(
    @Body() dto: { badge: string; titleHighlight: string; subtitle: string },
  ) {
    return this.homepageService.updateHero(dto);
  }

  @Put('coordinator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  updateCoordinator(
    @Body()
    dto: {
      name: string;
      role: string;
      department: string;
      image: string;
      bio: string;
      linkedin: string;
    },
  ) {
    return this.homepageService.updateCoordinator(dto);
  }

  @Post('journeys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.CREATED)
  createJourney(
    @Body()
    dto: {
      label: string;
      sublabel: string;
      image: string;
      description: string;
      gradient: string;
      order?: number;
    },
  ) {
    return this.homepageService.createJourney(dto);
  }

  @Put('journeys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  updateJourney(
    @Param('id') id: string,
    @Body()
    dto: {
      label: string;
      sublabel: string;
      image: string;
      description: string;
      gradient: string;
      order?: number;
    },
  ) {
    return this.homepageService.updateJourney(id, dto);
  }

  @Delete('journeys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  deleteJourney(@Param('id') id: string) {
    return this.homepageService.deleteJourney(id);
  }

  @Post('testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.CREATED)
  createTestimonial(
    @Body()
    dto: {
      name: string;
      role: string;
      rating: number;
      text: string;
      type: string;
      order?: number;
    },
  ) {
    return this.homepageService.createTestimonial(dto);
  }

  @Put('testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  updateTestimonial(
    @Param('id') id: string,
    @Body()
    dto: {
      name: string;
      role: string;
      rating: number;
      text: string;
      type: string;
      order?: number;
    },
  ) {
    return this.homepageService.updateTestimonial(id, dto);
  }

  @Delete('testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  deleteTestimonial(@Param('id') id: string) {
    return this.homepageService.deleteTestimonial(id);
  }

  @Post('team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.CREATED)
  createTeamMember(
    @Body()
    dto: {
      name: string;
      role: string;
      department: string;
      image: string;
      accent: string;
      type: string;
      order?: number;
    },
  ) {
    return this.homepageService.createTeamMember(dto);
  }

  @Put('team/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  updateTeamMember(
    @Param('id') id: string,
    @Body()
    dto: {
      name: string;
      role: string;
      department: string;
      image: string;
      accent: string;
      type: string;
      order?: number;
    },
  ) {
    return this.homepageService.updateTeamMember(id, dto);
  }

  @Delete('team/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  @HttpCode(HttpStatus.OK)
  deleteTeamMember(@Param('id') id: string) {
    return this.homepageService.deleteTeamMember(id);
  }
}
