"use client";

import axios from "axios";
import { API_URL } from "../consts/API";

interface DeliveryForm {
  productName: string;
  customerName: string;
  productValue: number;
  deliveryAddress: string;
  deliveryDate: string;
  observations?: string;
}

interface UpdateDeliveryStatusDto {
  status: "pending" | "delivered" | "canceled";
}

export interface DeliveryResponse {
  id: number;
  productName: string;
  customerName: string;
  productValue: number;
  deliveryAddress: string;
  deliveryDate: string;
  status?: "pending" | "delivered" | "canceled";
    observations?: string;
}

const createDelivery = async (
  data: DeliveryForm
): Promise<DeliveryResponse | undefined> => {
  try {
    const response = await axios.post<DeliveryResponse>(
      `${API_URL}/deliveries`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar entrega:", error);
    throw error;
  }
};

const getAllDeliveries = async (): Promise<DeliveryResponse[]> => {
  try {
    const response = await axios.get<DeliveryResponse[]>(
      `${API_URL}/deliveries`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar entregas:", error);
    return [];
  }
};

const getDeliveriesForDashboard = async (): Promise<DeliveryResponse[]> => {
  try {
    const response = await axios.get<DeliveryResponse[]>(
      `${API_URL}/deliveries`
    );

    return response.data.sort((a, b) => {
      const dateA = new Date(a.deliveryDate);
      const dateB = new Date(b.deliveryDate);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error("Erro ao buscar entregas para o dashboard:", error);
    return [];
  }
};

const getDeliveryById = async (
  id: number
): Promise<DeliveryResponse | undefined> => {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Autenticação necessária");
    }

    const response = await axios.get<DeliveryResponse>(
      `${API_URL}/deliveries/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar entrega ${id}:`, error);
    return undefined;
  }
};

const updateDelivery = async (
  id: number,
  data: Partial<DeliveryForm>
): Promise<DeliveryResponse | undefined> => {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Autenticação necessária");
    }

    const response = await axios.patch<DeliveryResponse>(
      `${API_URL}/deliveries/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar entrega ${id}:`, error);
    return undefined;
  }
};

const updateDeliveryStatus = async (
  id: number,
  statusData: UpdateDeliveryStatusDto
): Promise<DeliveryResponse | undefined> => {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Autenticação necessária");
    }

    const response = await axios.put<DeliveryResponse>(
      `${API_URL}/deliveries/${id}/status`,
      statusData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar status da entrega ${id}:`, error);
    return undefined;
  }
};

const removeDelivery = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/deliveries/${id}`);
    return true;
  } catch (error) {
    console.error(`Erro ao remover entrega ${id}:`, error);
    return false;
  }
};

const DeliveryService = {
  createDelivery,
  getAllDeliveries,
  getDeliveriesForDashboard,
  getDeliveryById,
  updateDelivery,
  updateDeliveryStatus,
  removeDelivery,
};

export default DeliveryService;
