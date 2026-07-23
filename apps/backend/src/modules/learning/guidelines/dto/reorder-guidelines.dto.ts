import { IsArray, IsString } from 'class-validator';

export class ReorderGuidelinesDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
