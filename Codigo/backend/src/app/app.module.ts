/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../domains/users/module/users.module';
import { AuthModule } from '../domains/auth/module/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { getDatabaseConfig } from './config/db.config';
import { DeliveriesModule } from '../domains/deliveries/module/deliveries.module';
import { DeliveryRoutesModule } from '../domains/routes/module/delivery-routes.module';
import { ReportsModule } from '../domains/reports/module/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => await getDatabaseConfig(),
    }),
    UsersModule,
    AuthModule,
    DeliveriesModule,
    DeliveryRoutesModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}