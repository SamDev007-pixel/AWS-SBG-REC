import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { GuidelineIcon, GuidelineThemeColor } from '@prisma/client';

export class CreateGuidelineDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GuidelineIcon)
  @IsNotEmpty()
  icon: GuidelineIcon;

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
