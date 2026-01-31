import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, NodePositionDto } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @IsDateString()
  @IsOptional()
  completedAt?: string | null;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @IsString()
  @IsOptional()
  aiPrompt?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => NodePositionDto)
  @IsOptional()
  nodePosition?: NodePositionDto;
}

