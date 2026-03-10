/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Delivery } from '../entity/delivery.entity';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from '../dto/update-delivery-status.dto';


@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  private normalizeDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    const {
      productName,
      customerName,
      productValue,
      deliveryAddress,
      deliveryDate,
      observations,
    } = createDeliveryDto;

    const correctedDate = this.normalizeDate(deliveryDate);

    const delivery = this.deliveryRepository.create({
      productName,
      customerName,
      productValue,
      deliveryAddress,
      deliveryDate: correctedDate,
      observations,
    });

    return this.deliveryRepository.save(delivery);
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.find();
  }

  async findOne(id: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }
    return delivery;
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    const delivery = await this.findOne(id);

    delivery.status = updateStatusDto.status;

    await this.deliveryRepository.save(delivery);

    return this.findOne(id);
  }

  async findByDate(date: string): Promise<Delivery[]> {
    const normalizedDate = this.normalizeDate(date);
    const dateString = normalizedDate.toISOString().split('T')[0];

    const deliveries = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('DATE(delivery.deliveryDate) = :date', { date: dateString })
      .getMany();

    return deliveries;
  }

  async update(
    id: number,
    updateDeliveryDto: UpdateDeliveryDto,
  ): Promise<Delivery> {
    const delivery = await this.findOne(id);

    if (updateDeliveryDto.deliveryDate) {
      updateDeliveryDto.deliveryDate = this.normalizeDate(
        updateDeliveryDto.deliveryDate,
      ).toISOString();
    }

    const updatedDelivery = Object.assign(delivery, updateDeliveryDto);
    await this.deliveryRepository.save(updatedDelivery);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.deliveryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }
  }
}