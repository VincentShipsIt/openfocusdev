import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class RecurrenceDto {
  @IsString()
  rule: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsNumber()
  @IsOptional()
  interval?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  daysOfWeek?: number[];

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class NodePositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  parentTaskId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  @IsOptional()
  recurrence?: RecurrenceDto;

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
