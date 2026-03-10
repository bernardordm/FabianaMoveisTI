/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from '../../deliveries/entity/delivery.entity';
import { ReportsController } from '../controller/reports.controller';
import { ReportsService } from '../service/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}