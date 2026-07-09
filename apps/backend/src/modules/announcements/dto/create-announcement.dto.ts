import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiPropertyOptional({ description: 'Event ID — required when targetType is EVENT', default: null })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Announcement message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Announcement category type', default: 'UPDATE' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Send email notification', default: false })
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Target audience: EVENT | CREW_ALL | CREW_SPECIFIC',
    default: 'EVENT',
  })
  @IsString()
  @IsOptional()
  @IsIn(['EVENT', 'CREW_ALL', 'CREW_SPECIFIC'])
  targetType?: string;

  @ApiPropertyOptional({
    description: 'Specific crew member user ID — only used when targetType is CREW_SPECIFIC',
  })
  @IsString()
  @IsOptional()
  targetCrewUserId?: string;
}
