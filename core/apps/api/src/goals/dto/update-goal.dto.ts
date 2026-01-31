import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

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

