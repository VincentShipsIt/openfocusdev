import { IsString, IsEnum } from 'class-validator';

export type ConnectionType = 'dependency' | 'sequence';

export class CreateConnectionDto {
  @IsString()
  sourceTaskId: string;

  @IsString()
  targetTaskId: string;

  @IsEnum(['dependency', 'sequence'])
  type: ConnectionType;
}
