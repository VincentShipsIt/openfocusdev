import { IsString, IsOptional } from 'class-validator';

export class TriggerAIExecutionDto {
  @IsString()
  @IsOptional()
  prompt?: string;
}
