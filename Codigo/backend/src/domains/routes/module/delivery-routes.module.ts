/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from '../entity/route.entity';
import { DeliveryRoutesController } from '../controller/delivery-routes.controller';
import { DeliveryRoutesService } from '../service/delivery-routes.service';
import { GoogleMapsService } from '../service/google-maps.service';
import { DeliveriesModule } from '../../deliveries/module/deliveries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route]),
    DeliveriesModule,
  ],
  controllers: [DeliveryRoutesController],
  providers: [DeliveryRoutesService, GoogleMapsService],
  exports: [DeliveryRoutesService, GoogleMapsService],
})
export class DeliveryRoutesModule {}