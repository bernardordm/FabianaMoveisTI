/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Navigation,
  Truck,
  CheckCircle,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import Header from "@components/header";
import RouteService from "../shared/services/route.service";
import DeliveryService, {
  DeliveryResponse,
} from "@/shared/services/delivery.service";
import dynamic from "next/dynamic";

const GoogleMapRoute = dynamic(
  () => import("../../app/components/google-map-route"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Navigation className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Carregando mapa...</p>
        </div>
      </div>
    ),
  }
);

type DeliveryAddress = {
  id: string;
  address: string;
  customerName: string;
  productName: string;
  estimatedTime: string;
  status: "pending" | "completed";
  order: number;
};

type Waypoint = {
  lat: number;
  lng: number;
  address: string;
};

type RouteData = {
  id: number;
  routeDate: string | Date;
  waypoints: Waypoint[] | string | any;
  optimizedRoute: string;
  totalDistance: number;
  totalDuration: number;
  mapsUrl: string;
};

const formatDateForDisplay = (dateStr: string | number | Date) => {
  if (!dateStr) return "";

  try {
    if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Erro ao formatar data para exibição:", error);
    return "";
  }
};

export default function RouteGenerator() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showRouteView, setShowRouteView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dailyDeliveries, setDailyDeliveries] = useState<DeliveryResponse[]>(
    []
  );
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    console.log("Data selecionada:", date);
    setSelectedDate(date);
  };

  const handleCopyLink = async () => {
    if (!routeData || !routeData.mapsUrl) return;

    try {
      await navigator.clipboard.writeText(routeData.mapsUrl);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  };

  const handleGenerateRoute = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Gerando rota para a data:", selectedDate);

      let route;

      try {
        console.log("Verificando se existe rota para:", selectedDate);
        route = await RouteService.getRouteByDate(selectedDate);
        console.log("Rota existente encontrada:", route);
      } catch (error: unknown) {
        console.log("Nenhuma rota existente encontrada, criando nova rota");
        route = null;
      }

      if (route) {
        console.log("Usando rota existente");
        setRouteData(route);
        await processRouteData(route);
      } else {
        console.log("Criando nova rota para a data:", selectedDate);
        try {
          const newRoute = await RouteService.createRoute(selectedDate);
          console.log("Nova rota criada:", newRoute);

          if (newRoute) {
            setRouteData(newRoute);
            await processRouteData(newRoute);
          } else {
            throw new Error("Não foi possível criar a rota");
          }
        } catch (createError: unknown) {
          const errorMessage =
            createError instanceof Error
              ? createError.message
              : "Erro ao criar a rota";

          console.error("Erro ao criar rota:", createError);
          throw new Error(errorMessage);
        }
      }

      setShowRouteView(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro detalhado:", err);
      setError(
        errorMessage ||
          "Erro ao gerar a rota. Verifique se existem entregas para esta data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const processRouteData = async (route: RouteData) => {
    try {
      console.log("Processando dados da rota:", route);

      const deliveries = await DeliveryService.getAllDeliveries();
      const selectedDateDeliveries = deliveries.filter((delivery) =>
        delivery.deliveryDate.includes(selectedDate)
      );
      setDailyDeliveries(selectedDateDeliveries);
      console.log("Entregas para a data selecionada:", selectedDateDeliveries);
      let waypointsArray: Waypoint[] = [];

      if (Array.isArray(route.waypoints)) {
        waypointsArray = route.waypoints;
      } else if (typeof route.waypoints === "string") {
        try {
          const parsed = JSON.parse(route.waypoints);
          if (Array.isArray(parsed)) {
            waypointsArray = parsed;
          } else {
            console.error(
              "Waypoints está em formato JSON, mas não é um array:",
              parsed
            );
          }
        } catch (e) {
          console.error("Erro ao parsear waypoints string:", e);
        }
      }

      console.log("Waypoints array processado:", waypointsArray);

      if (waypointsArray.length < 2) {
        console.warn(
          "Não há waypoints suficientes para processar",
          waypointsArray
        );
        setAddresses([]);
        return;
      }

      const deliveryWaypoints = waypointsArray.slice(1, -1);
      console.log("Waypoints de entrega:", deliveryWaypoints);

      const formattedAddresses: DeliveryAddress[] = deliveryWaypoints.map(
        (waypoint: any, index: number) => {
          const address =
            waypoint && waypoint.address
              ? waypoint.address
              : "Endereço não disponível";

          const matchingDelivery = selectedDateDeliveries.find(
            (delivery) =>
              delivery.deliveryAddress
                .toLowerCase()
                .includes(address.toLowerCase()) ||
              address
                .toLowerCase()
                .includes(delivery.deliveryAddress.toLowerCase())
          );

          return {
            id: `${index}`,
            address: address,
            customerName: matchingDelivery
              ? matchingDelivery.customerName
              : `Cliente ${index + 1}`,
            productName: matchingDelivery
              ? matchingDelivery.productName
              : "A ser entregue",
            estimatedTime: calculateEstimatedTime(index),
            status: "pending",
            order: index + 1,
          };
        }
      );

      console.log("Endereços formatados:", formattedAddresses);
      setAddresses(formattedAddresses);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao processar dados da rota:", errorMessage);
      setError("Erro ao processar dados da rota");
    }
  };

  const calculateEstimatedTime = (index: number) => {
    const baseHour = 9;
    const minutesPerDelivery = 45;

    const totalMinutes = baseHour * 60 + index * minutesPerDelivery;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBackToCalendar = () => {
    setShowRouteView(false);
  };

  const handleMarkAsCompleted = (id: string) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address.id === id ? { ...address, status: "completed" } : address
      )
    );
  };

  const DateSelectionView = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Selecione a data para gerar a rota
        </h3>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Data das entregas
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateSelect}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateRoute}
          disabled={!selectedDate || isLoading}
          className="w-full px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70"
        >
          {isLoading ? "Gerando rota..." : "Gerar rota de entregas"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-blue-600 mb-2">
          Informações sobre rotas
        </h3>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>
            As rotas são geradas com base nas entregas agendadas para a data
            selecionada
          </li>
          <li>
            O sistema organiza os endereços na ordem mais eficiente para entrega
          </li>
          <li>Você pode marcar entregas como concluídas durante o percurso</li>
          <li>
            Certifique-se de que todas as entregas do dia estão cadastradas
            antes de gerar a rota
          </li>
        </ul>
      </div>
    </div>
  );

  const RouteView = () => {
    if (!routeData) return null;

    const formattedDate = formatDateForDisplay(selectedDate);

    return (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Rota de entregas - {formattedDate}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-600">
            {addresses.length} entregas
          </span>
            </div>
          </div>

          {/* Estatísticas da rota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-600 mb-1">
                Distância total
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {routeData.totalDistance.toFixed(1)} km
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-600 mb-1">Tempo estimado</h4>
              <p className="text-2xl font-bold text-blue-600">
                {RouteService.formatDuration(routeData.totalDuration)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-600 mb-1">
                Quantidade de entregas
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {addresses.length}
              </p>
            </div>
          </div>

          {/* Mapa com a rota */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
            <div className="relative">
              {routeData ? (
                  <GoogleMapRoute waypoints={routeData.waypoints} />
              ) : (
                  <div className="bg-gray-100 rounded-lg w-full h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">
                        Mapa de rotas não disponível
                      </p>
                    </div>
                  </div>
              )}
            </div>

            <div className="mt-3 flex justify-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-xs text-gray-600">Ponto de partida</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-600">Entregas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Depósito (retorno)</span>
              </div>
            </div>

            {routeData && routeData.mapsUrl && (
                <div className="mt-2 text-center flex items-center justify-center gap-4">
                  <a
                      href={routeData.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm inline-flex items-center"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    <span>Abrir no Google Maps</span>
                  </a>

                  <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm inline-flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    <span>Copiar link</span>
                  </button>
                </div>
            )}
          </div>

          {/* Lista de endereços */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              Endereços de entrega
            </h4>

            <div className="space-y-3">
              {addresses.map((address) => (
                  <div
                      key={address.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {address.order}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800">
                          {address.customerName}
                        </h5>
                        <p className="text-gray-600 text-sm mb-1">
                          {address.address}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Produto: {address.productName}
                    </span>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Gerador de rotas" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link
              href="/home"
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Voltar</span>
            </Link>
            <h2 className="text-2xl font-bold">Gerador de Rotas</h2>
          </div>
        </div>

        {showRouteView ? <RouteView /> : <DateSelectionView />}
      </main>

      {/* Toast de notificação quando o link é copiado */}
      {showCopyNotification && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center z-50">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Link copiado para a área de transferência!</span>
        </div>
      )}
    </div>
  );
}
