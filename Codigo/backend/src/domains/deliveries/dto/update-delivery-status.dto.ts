/* eslint-disable */
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeliveryStatus } from '../entity/delivery.entity';

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  @IsNotEmpty()
  status: DeliveryStatus;
}