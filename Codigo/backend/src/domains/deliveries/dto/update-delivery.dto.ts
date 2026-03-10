/* eslint-disable */
import { IsOptional, IsString, IsNumber, IsPositive, IsDateString, MaxLength } from 'class-validator';

export class UpdateDeliveryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  productName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  customerName?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  productValue?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  deliveryAddress?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}