import { IsOptional, IsString } from 'class-validator';

export class TriggerAIExecutionDto {
  @IsString()
  @IsOptional()
  prompt?: string;
}
