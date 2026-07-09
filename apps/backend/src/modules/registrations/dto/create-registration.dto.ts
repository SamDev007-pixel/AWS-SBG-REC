import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationAnswerDto } from './registration-answer.dto';

export class CreateRegistrationDto {
  @ApiPropertyOptional({ description: 'User ID registering (optional for on-spot registrations)' })
  @IsString()
  @IsOptional()
  userId?: string;


  @ApiProperty({ description: 'Event ID to register for' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'Attendee Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Attendee Roll Number' })
  @IsString()
  @IsOptional()
  roll_number?: string;

  @ApiProperty({ description: 'Attendee Email' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9._%+-]+@rajalakshmi\.edu\.in$/, {
    message: 'Email must be a valid @rajalakshmi.edu.in address',
  })
  email?: string;

  @ApiProperty({ description: 'Attendee Department' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    type: [RegistrationAnswerDto],
    description: 'Form field answers',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RegistrationAnswerDto)
  answers?: RegistrationAnswerDto[];

  @ApiPropertyOptional({ description: 'Flag to indicate if registering via on-spot scan' })
  @IsOptional()
  onSpot?: boolean;
}
