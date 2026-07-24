import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/database/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventScheduler {
  private readonly logger = new Logger(EventScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/1 * * * *') // Run every minute
  async handleEventTransitions() {
    this.logger.debug('Running recurring event status transition checks...');
    const now = new Date();

    try {
      // Find all events that are not in DRAFT or ARCHIVED or COMPLETED status
      const events = await this.prisma.event.findMany({
        where: {
          status: {
            notIn: [EventStatus.DRAFT, EventStatus.ARCHIVED, EventStatus.COMPLETED],
          },
        },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });

      for (const event of events) {
        let targetStatus = event.status as EventStatus;
        const start = event.date ? new Date(event.date) : null;
        const end = event.endDatetime
          ? new Date(event.endDatetime)
          : start
          ? new Date(start.getTime() + 3 * 60 * 60 * 1000)
          : null;
        const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
        const capacity = event.capacity || 0;
        const regCount = event._count?.registrations ?? 0;

        const isOngoingTime = start && now > start && (!end || now <= end);
        const isCompletedTime = end && now > end;

        if (isCompletedTime) {
          // Only auto-complete if it is currently ongoing
          if (event.status === EventStatus.ONGOING) {
            targetStatus = EventStatus.COMPLETED;
          }
        } else if (isOngoingTime) {
          // Transition to ongoing when start time passes
          if (
            event.status === EventStatus.PUBLISHED ||
            event.status === EventStatus.REGISTRATION_OPEN ||
            event.status === EventStatus.REGISTRATION_CLOSED
          ) {
            targetStatus = EventStatus.ONGOING;
          }
        } else if (event.status === EventStatus.PUBLISHED || event.status === EventStatus.REGISTRATION_OPEN) {
          // Before start time: check deadline and capacity
          const isDeadlinePassed = deadline && now > deadline;
          const isCapacityReached = capacity > 0 && regCount >= capacity;

          if (isDeadlinePassed || isCapacityReached) {
            targetStatus = EventStatus.REGISTRATION_CLOSED;
          } else if (event.status === EventStatus.PUBLISHED) {
            targetStatus = EventStatus.REGISTRATION_OPEN;
          }
        }

        if (targetStatus !== event.status) {
          await this.prisma.event.update({
            where: { id: event.id },
            data: { status: targetStatus },
          });
          this.logger.log(
            `Transitioned Event "${event.title}" (${event.id}) from status ${event.status} to ${targetStatus}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to run event status transition checker:', error);
    }
  }
}
