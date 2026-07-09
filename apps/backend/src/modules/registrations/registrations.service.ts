import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { RegistrationStatus, EventStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetRegistrationsDto } from './dto/registrations.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateRegistrationDto) {
    let finalUserId = dto.userId;
    const { eventId, answers } = dto;

    if (!finalUserId && dto.email) {
      // 1. Check if user already exists by email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        // 2. Create new user account with default password
        const passwordHash = await bcrypt.hash('Attendee123!', 10);
        const nameParts = dto.name ? dto.name.trim().split(/\s+/) : ['Attendee'];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const newUser = await this.prisma.user.create({
          data: {
            email: dto.email,
            password: passwordHash,
            firstName,
            lastName,
            role: 'enthusiasts',
            isActive: true,
          },
        });
        finalUserId = newUser.id;
      }
    }

    if (!finalUserId) {
      throw new BadRequestException('User ID or Email is required for registration');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    // Fetch all FormField records for this event
    const formFields = await this.prisma.formField.findMany({
      where: { eventId },
    });

    const isCustomForm = event.registrationFormType === 'CUSTOM';

    // 1. Validate Base/System Fields
    const nameField = formFields.find((f) => f.label === 'Name');
    const rollNumberField = formFields.find((f) => f.label === 'Roll Number');
    const emailField = formFields.find((f) => f.label === 'Email');
    const departmentField = formFields.find((f) => f.label === 'Department');

    const isNameRequired = isCustomForm && nameField ? nameField.isRequired : true;
    const isRollNumberRequired = isCustomForm && rollNumberField ? rollNumberField.isRequired : true;
    const isEmailRequired = isCustomForm && emailField ? emailField.isRequired : true;
    const isDepartmentRequired = isCustomForm && departmentField ? departmentField.isRequired : true;

    if (isNameRequired && (!dto.name || !dto.name.trim())) {
      throw new BadRequestException('Full Name is required');
    }
    if (isRollNumberRequired && (!dto.roll_number || !dto.roll_number.trim())) {
      throw new BadRequestException('Registration / Roll Number is required');
    }
    if (isEmailRequired && (!dto.email || !dto.email.trim())) {
      throw new BadRequestException('Email address is required');
    }
    if (isDepartmentRequired && (!dto.department || !dto.department.trim())) {
      throw new BadRequestException('Department is required');
    }

    // 2. Validate Additional Custom Fields
    const customFormFields = formFields.filter(
      (f) => !['Name', 'Roll Number', 'Email', 'Department'].includes(f.label),
    );

    for (const field of customFormFields) {
      if (field.isRequired) {
        const answer = answers?.find(
          (a) => a.fieldId === field.id || a.fieldId === field.label,
        );
        if (!answer || answer.value === undefined || answer.value === null || String(answer.value).trim() === '') {
          throw new BadRequestException(`"${field.label}" is a required field`);
        }
      }
    }

    const isOnSpotAllowed = dto.onSpot && event.onSpotEnabled;

    if (!isOnSpotAllowed) {
      if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.REGISTRATION_OPEN) {
        throw new BadRequestException('Registration is not open for this event');
      }

      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: { status: EventStatus.REGISTRATION_CLOSED },
        });
        throw new BadRequestException('Registration deadline has passed');
      }
    }

    if (event.capacity) {
      const registrationCount = await this.prisma.registration.count({
        where: {
          eventId,
          status: { not: RegistrationStatus.CANCELLED },
        },
      });

      if (registrationCount >= event.capacity) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: { status: EventStatus.REGISTRATION_CLOSED },
        });
        throw new BadRequestException('Event has reached maximum capacity');
      }
    }

    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: finalUserId, eventId },
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    const registration = await this.prisma.registration.create({
      data: {
        userId: finalUserId,
        eventId,
        name: dto.name,
        roll_number: dto.roll_number,
        email: dto.email,
        department: dto.department,
        status: RegistrationStatus.CONFIRMED,
        answers: answers
          ? {
              create: answers.map((answer) => ({
                fieldId: answer.fieldId,
                value: answer.value,
              })),
            }
          : undefined,
      },
      include: {
        event: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        answers: true,
      },
    });

    this.notificationsService.sendRegistrationSuccess(finalUserId, event.title).catch(() => {});

    // 1. Generate unique ticket code
    const eventShortId = eventId.substring(0, 8).toUpperCase();
    const timestamp = Date.now();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `EVT-${eventShortId}-${timestamp}-${randomPart}`;

    // 2. Create the ticket record
    let ticket = await this.prisma.ticket.create({
      data: {
        registrationId: registration.id,
        eventId,
        ticketCode,
        status: 'ACTIVE',
        userName: dto.name || `${registration.user.firstName} ${registration.user.lastName}`.trim(),
        userRoll: dto.roll_number || '',
        userEmail: dto.email || registration.user.email,
        eventTitle: registration.event.title,
        eventDate: registration.event.date ? new Date(registration.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        eventTime: registration.event.time || (registration.event.date ? new Date(registration.event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''),
        eventVenue: registration.event.venue || '',
      },
    });

    // 3. Generate QR Code
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verificationUrl = `${appUrl}/verify/${ticket.id}`;
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
      });
      // 4. Update the ticket record with the QR code URL
      ticket = await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { qrCodeUrl },
      });
    } catch (e) {
      console.error('Failed to generate QR code:', e);
    }

    if (event.capacity) {
      const finalCount = await this.prisma.registration.count({
        where: {
          eventId,
          status: { not: RegistrationStatus.CANCELLED },
        },
      });
      if (finalCount >= event.capacity) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: { status: EventStatus.REGISTRATION_CLOSED },
        });
      }
    }

    return {
      ...registration,
      ticket,
    };
  }

  async findAll(pagination: GetRegistrationsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      eventId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status as RegistrationStatus;
    }

    if (startDate || endDate) {
      where.registrationDate = {};
      if (startDate) {
        where.registrationDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.registrationDate.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { roll_number: { contains: search, mode: 'insensitive' as const } },
        { department: { contains: search, mode: 'insensitive' as const } },
        {
          event: {
            title: { contains: search, mode: 'insensitive' as const },
          },
        },
        {
          ticket: {
            ticketCode: { contains: search, mode: 'insensitive' as const },
          },
        },
        {
          id: { contains: search, mode: 'insensitive' as const },
        },
      ];
    }

    const allowedSortFields = ['createdAt', 'registrationDate', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          event: {
            select: { id: true, title: true, date: true, venue: true, status: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ticket: true,
          answers: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return new PaginatedResponseDto(registrations, total, page, limit);
  }

  async findOne(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        ticket: true,
        answers: true,
      },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID "${id}" not found`);
    }

    return registration;
  }

  async findByEvent(eventId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const where = {
      eventId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { roll_number: { contains: search, mode: 'insensitive' as const } },
              { department: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'registrationDate', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ticket: true,
          answers: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return new PaginatedResponseDto(registrations, total, page, limit);
  }

  async findByUser(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search
        ? {
            event: {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'registrationDate', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          event: {
            select: { id: true, title: true, date: true, venue: true, status: true },
          },
          ticket: true,
          answers: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return new PaginatedResponseDto(registrations, total, page, limit);
  }

  async cancel(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { ticket: true },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID "${id}" not found`);
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration is already cancelled');
    }

    const updatedRegistration = await this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.update({
        where: { id },
        data: { status: RegistrationStatus.CANCELLED },
        include: {
          event: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ticket: true,
          answers: true,
        },
      });

      if (registration.ticket) {
        await tx.ticket.update({
          where: { registrationId: id },
          data: { status: TicketStatus.CANCELLED },
        });
      }

      return reg;
    });

    return updatedRegistration;
  }

  async getRegistrationCount(eventId: string): Promise<number> {
    return this.prisma.registration.count({
      where: {
        eventId,
        status: { not: RegistrationStatus.CANCELLED },
      },
    });
  }
}
