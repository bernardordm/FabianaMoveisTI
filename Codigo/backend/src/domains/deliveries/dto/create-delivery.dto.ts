/* eslint-disable */
import { IsNotEmpty, IsString, IsNumber, IsPositive, IsDateString, MaxLength, IsOptional } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsNumber()
  @IsPositive()
  productValue: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deliveryAddress: string;

  @IsDateString()
  @IsNotEmpty()
  deliveryDate: string;

  @IsString()
  @IsOptional()
  observations?: string;
}