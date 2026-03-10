/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { API_URL } from "../consts/API";

interface CreateRouteDto {
  routeDate: string;
}

interface RouteWaypoint {
  lat: number;
  lng: number;
  address: string;
}

interface RouteResponseDto {
  id: number;
  routeDate: Date | string;
  waypoints: RouteWaypoint[] | string | any;
  optimizedRoute: string;
  totalDistance: number;
  totalDuration: number;
  mapsUrl: string;
}

// Função para criar uma nova rota
const createRoute = async (
  date: string
): Promise<RouteResponseDto | undefined> => {
  try {
    const data: CreateRouteDto = {
      routeDate: date,
    };
    console.log(`Solicitando criação de rota para ${date}`);
    const response = await axios.post<RouteResponseDto>(
      `${API_URL}/delivery-routes`,
      data
    );
    console.log(`Rota criada com sucesso`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao gerar rota:", error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(`Erro ao gerar rota: ${error.response.data.message}`);
    }
    throw error;
  }
};

// Função para obter todas as rotas
const getAllRoutes = async (): Promise<RouteResponseDto[]> => {
  try {
    const response = await axios.get<RouteResponseDto[]>(
      `${API_URL}/delivery-routes`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar rotas:", error);
    return [];
  }
};

// Função para obter a rota mais recente
const getMostRecentRoute = async (): Promise<RouteResponseDto | undefined> => {
  try {
    const response = await axios.get<RouteResponseDto>(
      `${API_URL}/delivery-routes/latest`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar rota mais recente:", error);
    return undefined;
  }
};

// Função para obter uma rota por data
const getRouteByDate = async (
  date: string
): Promise<RouteResponseDto | undefined> => {
  try {
    const response = await axios.get<RouteResponseDto>(
      `${API_URL}/delivery-routes/date/${date}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.log(`Nenhuma rota encontrada para a data ${date}`);
      return undefined;
    }
    console.error(`Erro ao buscar rota para a data ${date}:`, error);
    throw error;
  }
};

// Função para obter endereços de entregas por data
const getAddressesByDate = async (date: string): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(
      `${API_URL}/delivery-routes/addresses?date=${date}`
    );
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar endereços para a data ${date}:`, error);
    return [];
  }
};

// Função para remover uma rota
const removeRoute = async (id: number): Promise<boolean> => {
  try {
    // Obtém o token JWT do localStorage (requer autenticação)
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Autenticação necessária");
    }

    await axios.delete(`${API_URL}/delivery-routes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error(`Erro ao remover rota ${id}:`, error);
    return false;
  }
};

const getRouteById = async (
  id: number
): Promise<RouteResponseDto | undefined> => {
  try {
    // Obtém todas as rotas e filtra pelo ID
    const routes = await getAllRoutes();
    return routes.find(route => route.id === id);
  } catch (error) {
    console.error(`Erro ao buscar rota com ID ${id}:`, error);
    return undefined;
  }
};

// Função para formatar a duração de segundos para um formato legível
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} minutos`;
};

const RouteService = {
  createRoute,
  getAllRoutes,
  getMostRecentRoute,
  getRouteByDate,
  getAddressesByDate,
  removeRoute,
  getRouteById,
  formatDuration,
};

export default RouteService;
