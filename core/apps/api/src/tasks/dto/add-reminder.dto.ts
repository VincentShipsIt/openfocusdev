import { IsString, IsOptional, IsNumber, IsDateString, ValidateIf } from 'class-validator';

export class AddReminderDto {
  @IsString()
  type: 'relative' | 'absolute';

  @ValidateIf((o) => o.type === 'absolute')
  @IsDateString()
  time?: string;

  @ValidateIf((o) => o.type === 'relative')
  @IsNumber()
  offset?: number; // Minutes before due date
}
