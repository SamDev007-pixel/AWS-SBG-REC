import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { GuidelineIcon, GuidelineThemeColor } from '@prisma/client';

export class UpdateGuidelineDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GuidelineIcon)
  @IsOptional()
  icon?: GuidelineIcon;

  @IsBoolean()
  @IsOptional()
  prominent?: boolean;

  @IsEnum(GuidelineThemeColor)
  @IsOptional()
  prominentColor?: GuidelineThemeColor;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
