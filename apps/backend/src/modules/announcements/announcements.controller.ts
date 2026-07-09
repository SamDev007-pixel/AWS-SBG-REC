import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new announcement (event, crew-all, or crew-specific)' })
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements (admin view)' })
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all announcements for a specific event' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.announcementsService.findByEvent(eventId);
  }

  @Get('crew')
  @ApiOperation({ summary: 'Get all crew-targeted announcements (CREW_ALL + CREW_SPECIFIC)' })
  findCrewAnnouncements() {
    return this.announcementsService.findCrewAnnouncements();
  }

  @Get('crew/me')
  @ApiOperation({ summary: 'Get announcements visible to a specific crew member' })
  @ApiQuery({ name: 'userId', required: true, description: 'Crew member user ID' })
  findForCrewMember(@Query('userId') userId: string) {
    return this.announcementsService.findForCrewMember(userId);
  }

  @Get('crew/members')
  @ApiOperation({ summary: 'List all users with role=crew (for targeting dropdown)' })
  findCrewMembers() {
    return this.announcementsService.findCrewMembers();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.remove(id);
  }
}
