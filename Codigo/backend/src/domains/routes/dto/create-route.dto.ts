/* eslint-disable */
import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateRouteDto {
  @IsDateString()
  @IsNotEmpty()
  routeDate: string;
}