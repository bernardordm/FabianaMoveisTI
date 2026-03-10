/* eslint-disable */
import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DeliveriesService } from '../service/deliveries.service';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from '../dto/update-delivery-status.dto';
import { JwtAuthGuard } from '../../auth/jwt/jwt.auth.guard';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Get()
  findAll() {
    return this.deliveriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveriesService.update(+id, updateDeliveryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateDeliveryStatusDto
  ) {
    return this.deliveriesService.updateStatus(+id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveriesService.remove(+id);
  }
}