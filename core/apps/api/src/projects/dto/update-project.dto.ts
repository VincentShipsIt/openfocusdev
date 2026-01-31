import { IsString, IsOptional, IsNumber, IsIn, IsArray, IsDateString, Min, Max } from 'class-validator';
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from '../schemas/project.schema';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string | null;

  @IsDateString()
  @IsOptional()
  targetLaunchDate?: string | null;

  @IsDateString()
  @IsOptional()
  launchedAt?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  distributionChannels?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  order?: number;
}

