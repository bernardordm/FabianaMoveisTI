/* eslint-disable */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Client, Status, TravelMode } from '@googlemaps/google-maps-services-js';
import axios from 'axios';

@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;
  private readonly client: Client;
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor() {
    this.apiKey = 'AIzaSyDdxdDa15HOkt0ryLCADFigFIAaaSN1bGo';
    this.client = new Client({});
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      this.logger.log(`Geocodificando endereço: ${address}`);

      const response = await this.client.geocode({
        params: {
          address: address,
          key: this.apiKey,
        },
      });

      if (response.data.status !== Status.OK || response.data.results.length === 0) {
        this.logger.warn(`Geocodificação falhou para: ${address}, status: ${response.data.status}`);
        throw new HttpException(`Geocoding failed: ${response.data.status}`, HttpStatus.BAD_REQUEST);
      }

      const location = response.data.results[0].geometry.location;
      this.logger.log(`Coordenadas obtidas: ${location.lat}, ${location.lng}`);
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      this.logger.error(`Falha ao geocodificar endereço: ${address}`, error.stack);
      throw new HttpException(
        `Failed to geocode address: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOptimizedRoute(
    waypoints: { lat: number; lng: number; address: string }[],
  ): Promise<any> {
    if (waypoints.length < 2) {
      throw new HttpException(
        'At least 2 waypoints are required for a route',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Calculando rota otimizada para ${waypoints.length} pontos`);

      // Usar coordenadas de latitude/longitude em vez de endereços
      const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
      const destination = `${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`;

      // Construir o array de waypoints como coordenadas
      let waypointsParam = '';
      if (waypoints.length > 2) {
        waypointsParam = 'optimize:true|' + waypoints
          .slice(1, waypoints.length - 1)
          .map(wp => `${wp.lat},${wp.lng}`)
          .join('|');
      }

      // Criar URL da API de direções
      const url = 'https://maps.googleapis.com/maps/api/directions/json';

      // Definir parâmetros da requisição
      const params: any = {
        origin,
        destination,
        key: this.apiKey,
        mode: 'driving'
      };

      // Adicionar waypoints se houver
      if (waypointsParam) {
        params.waypoints = waypointsParam;
      }

      // Fazer requisição direta usando Axios
      const { data } = await axios.get(url, { params });

      if (data.status !== 'OK') {
        this.logger.warn(`API de direções retornou erro: ${data.status}`);
        throw new HttpException(`Directions API error: ${data.status}`, HttpStatus.BAD_REQUEST);
      }

      // Processar resposta da API
      let totalDistance = 0;
      let totalDuration = 0;

      data.routes[0].legs.forEach((leg) => {
        totalDistance += leg.distance.value; // metros
        totalDuration += leg.duration.value; // segundos
      });

      // Criar URL para visualização no Google Maps
      const mapsUrl = this.createGoogleMapsUrlFromWaypoints(waypoints);

      return {
        route: data.routes[0],
        waypoints_order: data.routes[0].waypoint_order || [],
        totalDistance: totalDistance / 1000, // converter para km
        totalDuration, // em segundos
        mapsUrl,
      };
    } catch (error) {
      this.logger.error(`Falha ao obter direções: ${error.message}`);

      // Implementar a simulação de rota como fallback
      const totalDistance = 0;
      const totalDuration = 0;
      const mapsUrl = this.createGoogleMapsUrlFromWaypoints(waypoints);

      return {
        route: {
          legs: waypoints.slice(0, -1).map((wp, i) => ({
            distance: { value: 1000, text: '1 km' },
            duration: { value: 120, text: '2 mins' },
            start_location: { lat: wp.lat, lng: wp.lng },
            end_location: { lat: waypoints[i+1].lat, lng: waypoints[i+1].lng },
            start_address: wp.address,
            end_address: waypoints[i+1].address
          })),
          overview_polyline: { points: "simulado" }
        },
        waypoints_order: Array.from({ length: waypoints.length - 2 }, (_, i) => i),
        totalDistance: 10, // valor fictício
        totalDuration: 1200, // valor fictício (20 minutos)
        mapsUrl,
        isSimulated: true
      };
    }
  }

  createGoogleMapsUrl(
    origin: string,
    destination: string,
    waypoints: string[] = [],
  ): string {
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);
    const encodedWaypoints = waypoints.map(wp => encodeURIComponent(wp)).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;

    if (waypoints.length > 0) {
      url += `&waypoints=${encodedWaypoints}`;
    }

    url += '&travelmode=driving';

    return url;
  }


  createGoogleMapsUrlFromWaypoints(
    waypoints: { lat: number; lng: number; address: string }[],
  ): string {
    if (waypoints.length < 2) {
      return '';
    }

    return this.createGoogleMapsUrl(
      waypoints[0].address,
      waypoints[waypoints.length - 1].address,
      waypoints.slice(1, waypoints.length - 1).map(wp => wp.address)
    );
  }
}