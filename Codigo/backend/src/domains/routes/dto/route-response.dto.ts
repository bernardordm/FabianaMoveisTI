/* eslint-disable */
export class RouteResponseDto {
  id: number;
  routeDate: Date;
  waypoints: any[];
  optimizedRoute: string;
  totalDistance: number;
  totalDuration: number;
  mapsUrl?: string; // URL para abrir no Google Maps
}