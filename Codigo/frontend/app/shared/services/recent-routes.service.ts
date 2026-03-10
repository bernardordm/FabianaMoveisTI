/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import RouteService from "./route.service";
import DeliveryService from "./delivery.service";

export type RouteStatus = "completed" | "in-progress" | "canceled";

export type DeliveryRoute = {
  id: string;
  date: string;
  formattedDate: string;
  deliveriesCount: number;
  completedCount: number;
  driver: string;
  status: RouteStatus;
  createdAt: string;
  statusText?: string;
  statusColor?: string;
};

export type RouteDetails = {
  id: string;
  date: string;
  formattedDate: string;
  driver: string;
  status: RouteStatus;
  statusText?: string;
  statusColor?: string;
  totalDistance: number;
  totalDuration: number;
  waypoints: any;
  mapsUrl: string;
  deliveries: {
    id: string;
    address: string;
    customerName: string;
    productName: string;
    estimatedTime?: string;
    status: "pending" | "completed";
    order: number;
  }[];
};

// Função auxiliar para formatar data para exibição (DD/MM/YYYY)
const formatDateForDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Função auxiliar para formatar data e hora para exibição (DD/MM/YYYY HH:MM)
const formatDateTimeForDisplay = (date: Date): string => {
  const formattedDate = formatDateForDisplay(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${formattedDate} ${hours}:${minutes}`;
};

// Função para obter o texto do status
const getStatusText = (status: RouteStatus): string => {
  switch (status) {
    case "completed":
      return "Concluída";
    case "in-progress":
      return "Em andamento";
    case "canceled":
      return "Cancelada";
    default:
      return "";
  }
};

// Função para obter a cor do status para exibição
const getStatusColor = (status: RouteStatus): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
};

// Função para buscar todas as rotas recentes (últimos 30 dias)
const getRecentRoutes = async (): Promise<DeliveryRoute[]> => {
  try {
    // Buscar todas as rotas do sistema
    const routes = await RouteService.getAllRoutes();

    // Transformar para o formato esperado pelo componente de rotas recentes
    return routes.map((route) => {
      // CORREÇÃO: Garantir que a data seja tratada corretamente ajustando o timezone
      // Obter a data como string ISO e usar para criar um objeto Date preservando o timezone
      const dateStr =
        typeof route.routeDate === "string"
          ? route.routeDate
          : route.routeDate.toISOString();

      // Extrair apenas a parte da data (YYYY-MM-DD) sem modificar timezone
      const datePart = dateStr.split("T")[0];
      // Criar um novo objeto de data para formatar a exibição
      const dateObj = new Date(datePart + "T12:00:00");
      const formattedDate = formatDateForDisplay(dateObj);

      // Contar o número de entregas (waypoints menos o ponto inicial e final)
      let deliveriesCount = 0;
      let waypoints = [];

      if (Array.isArray(route.waypoints)) {
        waypoints = route.waypoints;
        // Primeira e última são origem e destino
        deliveriesCount = Math.max(0, waypoints.length - 2);
      } else if (typeof route.waypoints === "string") {
        try {
          waypoints = JSON.parse(route.waypoints);
          deliveriesCount = Math.max(0, waypoints.length - 2);
        } catch (e) {
          console.error("Erro ao parsejar waypoints", e);
        }
      }

      // Determinar o status da rota (por padrão, consideramos "in-progress")
      const status: RouteStatus = "in-progress";

      // Texto e cor do status para exibição
      const statusText = getStatusText(status);
      const statusColor = getStatusColor(status);

      // Data de criação formatada
      const createdAt = formatDateTimeForDisplay(new Date(route.routeDate));

      return {
        id: route.id.toString(),
        date: datePart,
        formattedDate,
        deliveriesCount,
        completedCount: 0,
        driver: "Motorista Anderson",
        status,
        createdAt,
        statusText,
        statusColor,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar rotas recentes:", error);
    return [];
  }
};

// Função para buscar detalhes de uma rota específica
const getRouteDetails = async (
  routeId: string
): Promise<RouteDetails | null> => {
  try {
    // Substituir getRouteById por getRouteByDate com adaptações
    const routes = await RouteService.getAllRoutes();
    const route = routes.find((route) => route.id === parseInt(routeId));

    if (!route) return null;

    const dateStr =
      typeof route.routeDate === "string"
        ? route.routeDate
        : route.routeDate.toISOString();
    const datePart = dateStr.split("T")[0];

    // Criar um novo objeto de data para formatar a exibição
    const dateObj = new Date(datePart + "T12:00:00");
    const formattedDate = formatDateForDisplay(dateObj);

    // Obter entregas para esta data
    const allDeliveries = await DeliveryService.getAllDeliveries();

    // Filtrar entregas pela data
    const routeDateDeliveries = allDeliveries.filter((delivery) =>
      delivery.deliveryDate.includes(datePart)
    );

    let status: RouteStatus = "in-progress";
    let statusText = "Em andamento";
    let statusColor = "bg-yellow-500";

    // Waypoints para entregas (ignorando primeiro e último)
    const waypointsArray =
      typeof route.waypoints === "string"
        ? JSON.parse(route.waypoints)
        : route.waypoints;

    const deliveryWaypoints = Array.isArray(waypointsArray)
      ? waypointsArray.slice(1, -1)
      : [];

    // Criar lista de entregas formatada para exibição
    const routeDeliveries = deliveryWaypoints.map((waypoint, index) => {
      const address =
        waypoint && waypoint.address
          ? waypoint.address
          : "Endereço não disponível";

      // Tentar encontrar a entrega correspondente pelo endereço
      const matchingDelivery = routeDateDeliveries.find(
        (delivery) =>
          delivery.deliveryAddress
            .toLowerCase()
            .includes(address.toLowerCase()) ||
          address.toLowerCase().includes(delivery.deliveryAddress.toLowerCase())
      );

      // IMPORTANTE: Verificar o status atual da entrega no backend
      let entryStatus = "pending";
      if (matchingDelivery) {
        if (
          matchingDelivery.status &&
          matchingDelivery.status === "delivered"
        ) {
          entryStatus = "completed";
        }
      }

      return {
        id: matchingDelivery ? matchingDelivery.id.toString() : `temp-${index}`,
        address,
        customerName: matchingDelivery
          ? matchingDelivery.customerName
          : `Cliente ${index + 1}`,
        productName: matchingDelivery
          ? matchingDelivery.productName
          : "A ser entregue",
        status: entryStatus as "pending" | "completed",
        order: index + 1,
      };
    });

    // Resto do código permanece igual...

    // Verificar se todas as entregas foram completadas
    const allCompleted =
      routeDeliveries.length > 0 &&
      routeDeliveries.every((delivery) => delivery.status === "completed");

    if (allCompleted) {
      status = "completed";
      statusText = "Concluída";
      statusColor = "bg-green-500";
    }

    return {
      id: route.id.toString(),
      date: datePart,
      formattedDate,
      driver: "Motorista padrão",
      status,
      statusText,
      statusColor,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      waypoints: waypointsArray,
      mapsUrl: route.mapsUrl,
      deliveries: routeDeliveries,
    };
  } catch (error) {
    console.error("Erro ao obter detalhes da rota:", error);
    return null;
  }
};

// Função para limpar o cache do serviço
const clearCache = () => {
  // Implementação futura se necessário
  console.log("Cache limpo");
};

const RecentRoutesService = {
  getRecentRoutes,
  getRouteDetails,
  clearCache,
};

export default RecentRoutesService;
