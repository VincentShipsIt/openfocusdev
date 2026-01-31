import { IsArray, IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(PROJECT_CATEGORIES)
  category?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  targetLaunchDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
