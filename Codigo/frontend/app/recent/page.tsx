"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  MapPin,
  Trash2,
  Truck,
  User,
  Navigation,
  CheckCircle,
  Search,
} from "lucide-react";
import Header from "../../app/components/header";
import RecentRoutesService, {
  DeliveryRoute,
  RouteDetails,
} from "../shared/services/recent-routes.service";
import RouteService from "../shared/services/route.service";
import dynamic from "next/dynamic";
import DeliveryService from "@/shared/services/delivery.service";

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

export default function RecentRoutes() {
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
      null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingDeliveryIds, setUpdatingDeliveryIds] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [recentRoutes, setRecentRoutes] = useState<DeliveryRoute[]>([]);

  useEffect(() => {
    fetchRecentRoutes();
  }, []);

  const fetchRecentRoutes = async () => {
    setIsLoading(true);
    try {
      const routes = await RecentRoutesService.getRecentRoutes();
      setRecentRoutes(routes);
    } catch (error) {
      console.error("Erro ao carregar rotas recentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRouteDetails = (routeId: string) => {
    setIsLoading(true);

    const fetchRouteDetails = async () => {
      try {
        const details = await RecentRoutesService.getRouteDetails(routeId);
        if (details) {
          setSelectedRoute(details);
        } else {
          console.error("Não foi possível encontrar detalhes da rota");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes da rota:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteDetails();
  };

  // Função para confirmar a exclusão de uma rota
  const handleConfirmDelete = (event: React.MouseEvent, routeId: string) => {
    event.stopPropagation(); // Evita que o clique propague para o card e abra os detalhes
    setDeleteConfirmation(routeId);
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que o clique propague para o card e abra os detalhes
    setDeleteConfirmation(null);
  };

  // Função para excluir uma rota
  const handleDeleteRoute = async (
      event: React.MouseEvent,
      routeId: string
  ) => {
    event.stopPropagation(); // Evita que o clique propague para o card e abra os detalhes
    setDeleteLoading(true);

    try {
      const success = await RouteService.removeRoute(parseInt(routeId));

      if (success) {
        // Atualiza a lista de rotas removendo a rota excluída
        setRecentRoutes((prevRoutes) =>
            prevRoutes.filter((route) => route.id !== routeId)
        );
        // Limpa a confirmação de exclusão
        setDeleteConfirmation(null);
      } else {
        alert("Não foi possível excluir a rota. Verifique suas permissões.");
      }
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      alert("Ocorreu um erro ao excluir a rota.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Função para voltar à lista de rotas
  const handleBackToList = () => {
    setSelectedRoute(null);
  };

  // Função para mostrar uma notificação
  const showSuccessNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Função para alternar o status da entrega (pendente/concluída)
  const handleToggleDeliveryStatus = async (id: string) => {
    if (!selectedRoute) {
      return;
    }

    // Encontre a entrega nos deliveries
    const delivery = selectedRoute.deliveries.find((d) => d.id === id);

    if (!delivery) {
      return;
    }

    // Adiciona este ID à lista de IDs em atualização
    setUpdatingDeliveryIds((prev) => [...prev, id]);

    try {
      // Obter todas as entregas
      const allDeliveries = await DeliveryService.getAllDeliveries();

      // Encontrar a entrega correspondente pelo endereço
      const matchingDelivery = allDeliveries.find(
          (d) =>
              d.deliveryAddress
                  .toLowerCase()
                  .includes(delivery.address.toLowerCase()) ||
              delivery.address
                  .toLowerCase()
                  .includes(d.deliveryAddress.toLowerCase())
      );

      // Use o ID da entrega correspondente se encontrado, ou tente o ID recebido
      const deliveryId = matchingDelivery
          ? matchingDelivery.id
          : parseInt(delivery.id);

      if (isNaN(deliveryId) || deliveryId <= 0) {
        throw new Error(`ID de entrega inválido: ${delivery.id}`);
      }

      // Determinar o novo status (alternar entre pendente e concluído)
      const newStatus = delivery.status === "completed" ? "pending" : "delivered";
      const backendStatus = newStatus === "pending" ? "pending" : "delivered";

      // Chamada para a API para atualizar o status
      const updatedDelivery = await DeliveryService.updateDeliveryStatus(
          deliveryId,
          { status: backendStatus }
      );

      if (updatedDelivery) {
        // Atualiza o estado local
        setSelectedRoute({
          ...selectedRoute,
          deliveries: selectedRoute.deliveries.map((d) =>
              d.id === id ? { ...d, status: newStatus === "delivered" ? "completed" : "pending" } : d
          ),
        });

        // Mostrar notificação de sucesso
        const message = newStatus === "delivered"
            ? "Entrega marcada como concluída com sucesso!"
            : "Entrega marcada como pendente com sucesso!";

        showSuccessNotification(message);
      } else {
        throw new Error("Falha ao atualizar o status da entrega");
      }
    } catch (error) {
      console.error("Erro ao atualizar status da entrega:", error);
      alert(
          error instanceof Error
              ? error.message
              : "Não foi possível atualizar o status da entrega"
      );
    } finally {
      // Remove este ID da lista de IDs em atualização
      setUpdatingDeliveryIds((prev) =>
          prev.filter((deliveryId) => deliveryId !== id)
      );
    }
  };

  // Filtrar rotas com base no filtro de data e termo de busca
  const filteredRoutes = recentRoutes.filter((route) => {
    // Filtro de data
    const dateMatches = dateFilter === "" || route.date === dateFilter;

    // Filtro de busca
    const searchMatches =
        searchTerm === "" ||
        route.formattedDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.id.toLowerCase().includes(searchTerm.toLowerCase());

    return dateMatches && searchMatches;
  });

  // Componente para a lista de rotas recentes
  const RoutesList = () => (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Filtro de data - visível em todas as telas */}
            <div className="relative order-2 md:order-1">
              <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 border text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>

            </div>

            {/* Barra de pesquisa - visível apenas em telas maiores */}
            <div className="relative flex-grow order-1 md:order-2 md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                  type="text"
                  placeholder="Buscar rotas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 focus:border-blue-500 w-full md:max-w-md"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4">Rotas recentes</h3>

          {filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isLoading
                    ? "Carregando rotas..."
                    : "Nenhuma rota encontrada com os filtros aplicados."}
              </div>
          ) : (
              <div className="space-y-4">
                {filteredRoutes.map((route) => (
                    <div
                        key={route.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => handleViewRouteDetails(route.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <h4 className="font-bold text-gray-800">
                              Rota de entregas - {route.formattedDate}
                            </h4>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-1 text-gray-500" />
                              <span>
                          {route.completedCount}/{route.deliveriesCount}{" "}
                                entregas
                        </span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Motorista: Anderson</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {deleteConfirmation === route.id ? (
                              <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600 font-medium">
                          Confirmar exclusão?
                        </span>
                                <button
                                    onClick={(e) => handleDeleteRoute(e, route.id)}
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                    disabled={deleteLoading}
                                >
                                  {deleteLoading ? "..." : "Sim"}
                                </button>
                                <button
                                    onClick={(e) => handleCancelDelete(e)}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                >
                                  Não
                                </button>
                              </div>
                          ) : (
                              <>
                                <button
                                    onClick={(e) => handleConfirmDelete(e, route.id)}
                                    className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Excluir rota"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                <ChevronRight className="h-5 w-5 text-blue-600" />
                              </>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );

  // Componente para os detalhes de uma rota específica
  const RouteDetailsView = () => {
    if (!selectedRoute) return null;

    const handleCopyLink = () => {
      if (selectedRoute.mapsUrl) {
        navigator.clipboard
            .writeText(selectedRoute.mapsUrl)
            .then(() => {
              showSuccessNotification("Link copiado para a área de transferência!");
            })
            .catch((err) => {
              console.error("Erro ao copiar: ", err);
            });
      }
    };

    return (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <button
                onClick={handleBackToList}
                className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Voltar para lista</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Rota de entregas - {selectedRoute.formattedDate}
              </h3>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-600">
                  {selectedRoute.deliveries.length} entregas
                </span>
                </div>
              </div>
            </div>

            {/* Estatísticas da rota */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-600 mb-1">
                  Distância total
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedRoute.totalDistance.toFixed(1)} km
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-600 mb-1">
                  Tempo estimado
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {RouteService.formatDuration(selectedRoute.totalDuration)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-600 mb-1">
                  Quantidade de entregas
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedRoute.deliveries.length}
                </p>
              </div>
            </div>

            {/* Mapa com a rota */}
            <div className="relative">
              <GoogleMapRoute waypoints={selectedRoute.waypoints} />
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

            {selectedRoute.mapsUrl && (
                <div className="mt-4 flex justify-center gap-3">
                  <a
                      href={selectedRoute.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Abrir no Google Maps</span>
                  </a>
                  <button
                      onClick={handleCopyLink}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center gap-2"
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    <span>Copiar link</span>
                  </button>
                </div>
            )}
          </div>

          {/* Lista de endereços */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              Endereços de entrega
            </h4>

            <div className="space-y-3">
              {selectedRoute.deliveries.map((delivery) => (
                  <div
                      key={delivery.id}
                      className={`border rounded-lg p-4 ${
                          delivery.status === "completed"
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                          {delivery.order}
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">
                            {delivery.customerName}
                          </h5>
                          <p className="text-gray-600 text-sm mb-1">
                            {delivery.address}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          Produto: {delivery.productName}
                        </span>
                          </div>
                        </div>
                      </div>
                      <button
                          onClick={() => handleToggleDeliveryStatus(delivery.id)}
                          disabled={updatingDeliveryIds.includes(delivery.id)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                              delivery.status === "completed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                  : updatingDeliveryIds.includes(delivery.id)
                                      ? "bg-gray-100 text-gray-500"
                                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                          }`}
                      >
                        {updatingDeliveryIds.includes(delivery.id)
                            ? "Atualizando..."
                            : delivery.status === "completed"
                                ? "Concluído"
                                : "Pendente"}
                      </button>
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
        <Header title="Rotas recentes" />

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
              <h2 className="text-2xl font-bold">Rotas Recentes</h2>
            </div>
          </div>

          {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-pulse text-blue-600">Carregando...</div>
              </div>
          ) : selectedRoute ? (
              <RouteDetailsView />
          ) : (
              <RoutesList />
          )}
        </main>

        {/* Notificação de sucesso */}
        {showNotification && (
            <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center animate-fade-in-up z-50">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{notificationMessage}</span>
            </div>
        )}
      </div>
  );
}