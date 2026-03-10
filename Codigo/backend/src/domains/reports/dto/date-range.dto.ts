/* eslint-disable */
import { IsNotEmpty, IsDateString } from 'class-validator';

export class DateRangeDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}