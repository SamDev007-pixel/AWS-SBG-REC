import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { EmailService } from '@/modules/notifications/email.service';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateAnnouncementDto) {
    const targetType = dto.targetType || 'EVENT';

    // Validate event-scoped announcements
    if (targetType === 'EVENT') {
      if (!dto.eventId) {
        throw new BadRequestException('eventId is required when targetType is EVENT');
      }
      const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
      if (!event) {
        throw new NotFoundException(`Event with ID "${dto.eventId}" not found`);
      }
    }

    // Validate crew-specific announcements
    if (targetType === 'CREW_SPECIFIC') {
      if (!dto.targetCrewUserId) {
        throw new BadRequestException('targetCrewUserId is required when targetType is CREW_SPECIFIC');
      }
      const crewUser = await this.prisma.user.findUnique({ where: { id: dto.targetCrewUserId } });
      if (!crewUser) {
        throw new NotFoundException(`Crew member with ID "${dto.targetCrewUserId}" not found`);
      }
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        eventId: dto.eventId ?? null,
        title: dto.title,
        message: dto.message,
        type: dto.type ?? 'UPDATE',
        sendEmail: dto.sendEmail ?? false,
        targetType,
        targetCrewUserId: dto.targetCrewUserId ?? null,
      },
    });

    if (dto.sendEmail && targetType === 'EVENT') {
      this.sendAnnouncementEmail(announcement.id).catch((err) =>
        this.logger.error(`Failed to send announcement email: ${err.message}`),
      );
    }

    return announcement;
  }

  async findByEvent(eventId: string) {
    return this.prisma.announcement.findMany({
      where: {
        eventId,
        NOT: { id: { startsWith: 'ann-seed' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      where: { NOT: { id: { startsWith: 'ann-seed' } } },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** All crew-targeted announcements (for Core Admin feed) */
  async findCrewAnnouncements() {
    return this.prisma.announcement.findMany({
      where: {
        targetType: { in: ['CREW_ALL', 'CREW_SPECIFIC'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Announcements visible to a specific crew member:
   * – CREW_ALL announcements (broadcast to all crew)
   * – CREW_SPECIFIC announcements addressed to this user
   */
  async findForCrewMember(userId: string) {
    return this.prisma.announcement.findMany({
      where: {
        OR: [
          { targetType: 'CREW_ALL' },
          { targetType: 'CREW_SPECIFIC', targetCrewUserId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }
    return announcement;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.announcement.delete({ where: { id } });
  }

  async sendAnnouncementEmail(announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        event: {
          include: {
            registrations: { include: { user: true } },
          },
        },
      },
    });

    if (!announcement || !announcement.sendEmail || !announcement.event) return;

    const emailPromises = announcement.event.registrations.map((reg) =>
      this.emailService.sendMail(
        reg.user.email,
        `[${announcement.event!.title}] ${announcement.title}`,
        this.buildAnnouncementHtml(
          announcement.title,
          announcement.message,
          announcement.type,
          announcement.event!.title,
        ),
      ),
    );

    await Promise.allSettled(emailPromises);
  }

  /** Fetch all users with role = "crew" or relation roles (VOLUNTEER, SCANNER) for the target dropdown */
  async findCrewMembers() {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { role: 'crew' },
          {
            roles: {
              some: {
                role: {
                  name: {
                    in: ['VOLUNTEER', 'SCANNER'],
                  },
                },
              },
            },
          },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: 'asc' },
    });
  }

  private buildAnnouncementHtml(
    title: string,
    message: string,
    type: string,
    eventTitle: string,
  ): string {
    const headerColor = this.getHeaderColor(type);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: ${headerColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; color: #333; }
          .message { background: #f9f9f9; border-radius: 6px; padding: 15px; margin: 15px 0; line-height: 1.6; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; background: ${headerColor}; margin-bottom: 10px; }
          .footer { text-align: center; padding: 15px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">${type}</div>
            <h1>${title}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${eventTitle}</p>
          </div>
          <div class="content">
            <div class="message">${message}</div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AWS SBG REC. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getHeaderColor(type: string): string {
    switch (type) {
      case 'REMINDER': return '#FF9900';
      case 'SCHEDULE_CHANGE': return '#f44336';
      case 'UPDATE': return '#232F3E';
      default: return '#232F3E';
    }
  }
}
