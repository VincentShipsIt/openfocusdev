import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum GoalCategory {
  BUSINESS = 'business',
  PERSONAL = 'personal',
}

export class UpdateMilestoneDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class UpdateGoalDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GoalCategory)
  @IsOptional()
  category?: GoalCategory;

  @IsNumber()
  @IsOptional()
  targetYear?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMilestoneDto)
  @IsOptional()
  milestones?: UpdateMilestoneDto[];
}
