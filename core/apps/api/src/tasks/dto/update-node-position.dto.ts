import { IsNumber } from 'class-validator';

export class UpdateNodePositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}
