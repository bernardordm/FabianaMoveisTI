/* eslint-disable */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsPositive,
  IsEnum, IsOptional, IsString,
} from 'class-validator';

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @IsNotEmpty()
  productName: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  customerName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @IsPositive()
  productValue: number;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @Column({ length: 255 })
  @IsNotEmpty()
  deliveryAddress: string;

  @Column({ type: 'date' })
  @IsDateString()
  deliveryDate: Date;

  @Column({type: 'text', nullable: true})
  @IsOptional()
  @IsString()
  observations?: string;
}
