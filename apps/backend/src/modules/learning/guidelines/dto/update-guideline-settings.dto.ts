import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { GuidelineIcon } from '@prisma/client';

export class UpdateGuidelineSettingsDto {
  @IsEnum(GuidelineIcon)
  @IsOptional()
  headerIcon?: GuidelineIcon;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  headerTitle?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  headerDescription?: string;
}
