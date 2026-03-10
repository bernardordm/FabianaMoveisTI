/* eslint-disable */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entity/route.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { RouteResponseDto } from '../dto/route-response.dto';
import { GoogleMapsService } from './google-maps.service';
import { DeliveriesService } from '../../deliveries/service/deliveries.service';

@Injectable()
export class DeliveryRoutesService {
  private readonly logger = new Logger(DeliveryRoutesService.name);
  private readonly storeAddress = "Rua Comendador Antônio Alves, 617 - Centro, Pedro Leopoldo"; // Endereço fixo da loja
  private readonly warehouseAddress = "Rua Salgado Filho, 600, Centro, Pedro Leopoldo"; // Endereço do depósito

  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    private googleMapsService: GoogleMapsService,
    private deliveriesService: DeliveriesService,
  ) {
  }

  // Função para padronizar o formato de data e evitar problemas de timezone
  private normalizeDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Usa UTC para evitar problemas com timezone
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  async getDeliveryAddressesByDate(date: string): Promise<string[]> {
    // Busca as entregas para a data informada
    const deliveries = await this.deliveriesService.findByDate(date);

    if (!deliveries || deliveries.length === 0) {
      throw new NotFoundException(`No deliveries found for date ${date}`);
    }

    this.logger.log(`Encontradas ${deliveries.length} entregas para a data ${date}`);

    // Retorna apenas os endereços das entregas
    return deliveries.map(delivery => delivery.deliveryAddress);
  }

  async createRoute(createRouteDto: CreateRouteDto): Promise<RouteResponseDto> {
    const { routeDate } = createRouteDto;
    this.logger.log(`Criando rota para a data: ${routeDate}`);

    // Normaliza a data para evitar problemas de timezone
    const normalizedDate = this.normalizeDate(routeDate);

    // Verifica se já existe uma rota para a data
    let existingRoute = await this.routeRepository.findOne({
      where: { routeDate: normalizedDate },
    });

    // Busca os endereços das entregas para a data
    const deliveryAddresses = await this.getDeliveryAddressesByDate(routeDate);
    this.logger.log(`Endereços encontrados: ${deliveryAddresses.join(', ')}`);

    try {
      // Geocodifica o endereço da loja (ponto inicial)
      const storeCoords = await this.googleMapsService.geocodeAddress(this.storeAddress);

      // Geocodifica o endereço do depósito (ponto final)
      const warehouseCoords = await this.googleMapsService.geocodeAddress(this.warehouseAddress);

      // Geocodifica os endereços de entrega
      const deliveryWaypoints = await Promise.all(
        deliveryAddresses.map(async (address) => {
          const coords = await this.googleMapsService.geocodeAddress(address);
          return { ...coords, address };
        }),
      );

      // Cria um array com o ponto inicial (loja), todos os pontos de entrega, e o ponto final (depósito)
      const allWaypoints = [
        { ...storeCoords, address: this.storeAddress },
        ...deliveryWaypoints,
        { ...warehouseCoords, address: this.warehouseAddress }
      ];

      this.logger.log(`Endereços geocodificados com sucesso: ${allWaypoints.length} pontos (incluindo loja e depósito)`);

      // Obtém a rota otimizada usando o Google Maps
      const optimizedRoute = await this.googleMapsService.getOptimizedRoute(allWaypoints);
      this.logger.log(`Rota otimizada gerada com sucesso`);

      // Cria ou atualiza a rota no banco
      if (!existingRoute) {
        existingRoute = this.routeRepository.create({
          routeDate: normalizedDate, // Usa a data normalizada
          waypoints: allWaypoints,
          optimizedRoute: JSON.stringify(optimizedRoute.route),
          totalDistance: optimizedRoute.totalDistance,
          totalDuration: optimizedRoute.totalDuration,
        });
        this.logger.log(`Criando nova rota para data ${routeDate}`);
      } else {
        existingRoute.waypoints = allWaypoints;
        existingRoute.optimizedRoute = JSON.stringify(optimizedRoute.route);
        existingRoute.totalDistance = optimizedRoute.totalDistance;
        existingRoute.totalDuration = optimizedRoute.totalDuration;
        this.logger.log(`Atualizando rota existente para data ${routeDate}`);
      }

      const savedRoute = await this.routeRepository.save(existingRoute);
      this.logger.log(`Rota salva com sucesso. ID: ${savedRoute.id}`);

      // Prepara a resposta
      const response: RouteResponseDto = {
        id: savedRoute.id,
        routeDate: savedRoute.routeDate,
        waypoints: savedRoute.waypoints,
        optimizedRoute: savedRoute.optimizedRoute,
        totalDistance: savedRoute.totalDistance,
        totalDuration: savedRoute.totalDuration,
        mapsUrl: optimizedRoute.mapsUrl,
      };

      return response;
    } catch (error) {
      this.logger.error(`Erro ao criar rota: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<RouteResponseDto[]> {
    const routes = await this.routeRepository.find();
    return routes.map(route => ({
      id: route.id,
      routeDate: route.routeDate,
      waypoints: route.waypoints,
      optimizedRoute: route.optimizedRoute,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      mapsUrl: this.googleMapsService.createGoogleMapsUrlFromWaypoints(route.waypoints),
    }));
  }

  async findByDate(date: string): Promise<RouteResponseDto> {
    // Normaliza a data para evitar problemas de timezone
    const normalizedDate = this.normalizeDate(date);

    const route = await this.routeRepository.findOne({
      where: { routeDate: normalizedDate },
    });

    if (!route) {
      throw new NotFoundException(`Route for date ${date} not found`);
    }

    // Recria a URL do Google Maps
    const mapsUrl = this.googleMapsService.createGoogleMapsUrlFromWaypoints(route.waypoints);

    return {
      id: route.id,
      routeDate: route.routeDate,
      waypoints: route.waypoints,
      optimizedRoute: route.optimizedRoute,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      mapsUrl,
    };
  }

  async findMostRecent(): Promise<RouteResponseDto> {
    const route = await this.routeRepository.findOne({
      order: { createdAt: 'DESC' },
    });

    if (!route) {
      throw new NotFoundException('No routes found');
    }

    // Recria a URL do Google Maps
    const mapsUrl = this.googleMapsService.createGoogleMapsUrlFromWaypoints(route.waypoints);

    return {
      id: route.id,
      routeDate: route.routeDate,
      waypoints: route.waypoints,
      optimizedRoute: route.optimizedRoute,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      mapsUrl,
    };
  }

  async remove(id: number): Promise<void> {
    const result = await this.routeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
  }
}