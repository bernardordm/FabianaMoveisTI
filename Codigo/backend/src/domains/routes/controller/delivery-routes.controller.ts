/* eslint-disable */
import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DeliveryRoutesService } from '../service/delivery-routes.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { JwtAuthGuard } from '../../auth/jwt/jwt.auth.guard';

@Controller('delivery-routes')
export class DeliveryRoutesController {
  constructor(private readonly deliveryRoutesService: DeliveryRoutesService) {}

  @Post()
  createRoute(@Body() createRouteDto: CreateRouteDto) {
    return this.deliveryRoutesService.createRoute(createRouteDto);
  }

  @Get()
  findAll() {
    return this.deliveryRoutesService.findAll();
  }

  @Get('latest')
  findMostRecent() {
    return this.deliveryRoutesService.findMostRecent();
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.deliveryRoutesService.findByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryRoutesService.remove(+id);
  }

  @Get('addresses')
  getAddressesByDate(@Query('date') date: string) {
    return this.deliveryRoutesService.getDeliveryAddressesByDate(date);
  }
}