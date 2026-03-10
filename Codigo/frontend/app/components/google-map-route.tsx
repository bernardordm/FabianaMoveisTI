/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from 'react';

interface Waypoint {
    lat: number;
    lng: number;
    address: string;
}

interface GoogleMapRouteProps {
    waypoints: Waypoint[] | string | Record<string, Waypoint>;
}

// Variável global para controlar se o script já foi carregado
let googleMapsLoaded = false;

const GoogleMapRoute: React.FC<GoogleMapRouteProps> = ({ waypoints }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    // Use 'unknown' em vez de 'any' para uma melhor prática com TypeScript
    const mapInstanceRef = useRef<unknown>(null);

    useEffect(() => {
        // Função para inicializar o mapa
        const initMap = (): void => {
            if (!mapRef.current) return;

            // Processar waypoints para garantir que seja um array
            let waypointsArray: Waypoint[] = [];

            if (Array.isArray(waypoints)) {
                waypointsArray = waypoints;
            } else if (typeof waypoints === 'string') {
                try {
                    waypointsArray = JSON.parse(waypoints);
                } catch (e) {
                    console.error("Erro ao parsear waypoints:", e);
                    return;
                }
            } else if (waypoints && typeof waypoints === 'object') {
                try {
                    waypointsArray = Object.values(waypoints);
                } catch (e) {
                    console.error("Erro ao processar waypoints:", e);
                    return;
                }
            }

            if (!Array.isArray(waypointsArray) || waypointsArray.length < 2) {
                console.error("Não há waypoints suficientes", waypointsArray);
                return;
            }

            console.log("Waypoints processados para o mapa:", waypointsArray);

            // Verifica se o objeto google existe no window
            if (!window.google || !window.google.maps) {
                console.error("API do Google Maps não disponível");
                return;
            }

            // Criar o mapa
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 10,
                center: { lat: -19.591309, lng: -44.0022277 }, // Pedro Leopoldo
                mapTypeId: window.google.maps.MapTypeId.ROADMAP
            });

            // Armazena a referência do mapa
            mapInstanceRef.current = map;

            // Configurar o serviço de direções
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: false
            });

            // Configurar a requisição de rota
            const request = {
                origin: waypointsArray[0].address,
                destination: waypointsArray[waypointsArray.length - 1].address,
                waypoints: waypointsArray.slice(1, -1).map(wp => ({
                    location: wp.address,
                    stopover: true
                })),
                travelMode: window.google.maps.TravelMode.DRIVING,
                optimizeWaypoints: true
            };

            // Solicitar a rota
            directionsService.route(
                request,
                function(result: any, status: string) {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                    } else {
                        console.error('Erro ao gerar rota:', status);
                    }
                }
            );
        };

        // Função que verifica e inicializa o mapa quando o Google Maps estiver pronto
        const loadMap = () => {
            if (window.google && window.google.maps) {
                initMap();
                return true;
            }
            return false;
        };

        // Tenta carregar o mapa imediatamente se o Google Maps já estiver disponível
        if (loadMap()) return;

        // Se chegou aqui, o Google Maps ainda não está carregado
        if (!googleMapsLoaded) {
            googleMapsLoaded = true; // Marca que já estamos carregando para evitar duplicação

            // Cria uma função global que será chamada quando o script carregar
            window.initGoogleMap = function() {
                // Inicializa o mapa imediatamente
                initMap();

                // Dispara um evento personalizado para que outros componentes possam reagir
                window.dispatchEvent(new Event('googleMapsLoaded'));
            };

            // Cria e adiciona o script ao DOM
            const script = document.createElement('script');
            script.id = 'google-maps-script'; // Adiciona um ID para facilitar a identificação
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDdxdDa15HOkt0ryLCADFigFIAaaSN1bGo&libraries=places&callback=initGoogleMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            return () => {
                // Não remover o script no cleanup para evitar problemas de múltiplos carregamentos
                // Apenas limpar a referência global se necessário
                if (window.initGoogleMap === initMap) {
                    window.initGoogleMap = undefined;
                }
            };
        } else {
            // O script está sendo carregado, mas ainda não terminou
            // Adicionamos um listener para quando estiver pronto
            const handleGoogleMapsLoaded = () => {
                initMap();
            };

            window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);

            return () => {
                window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
            };
        }
    }, [waypoints]);

    return (
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: '400px',
                borderRadius: '0.5rem'
            }}
        />
    );
};

// Declaração para TypeScript - define explicitamente como 'any' e usa function
declare global {
    interface Window {
        google: any; // Mantenha como 'any' para compatibilidade simplificada
        initGoogleMap: (() => void) | undefined;
    }
}

export default GoogleMapRoute;