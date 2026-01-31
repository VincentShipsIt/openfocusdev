import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum GoalCategory {
  BUSINESS = 'business',
  PERSONAL = 'personal',
}

export class CreateMilestoneDto {
  @IsString()
  title: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CreateGoalDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GoalCategory)
  category: GoalCategory;

  @IsNumber()
  targetYear: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  @IsOptional()
  milestones?: CreateMilestoneDto[];
}

