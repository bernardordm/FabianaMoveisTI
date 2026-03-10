"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BarChart3, Clock, MapPin, Truck, ChevronRight } from "lucide-react"
import Header from "@components/header"
import { reportService } from "@services/report.service"
import { useAuth } from "@hooks/useAuth"
import DeliveryService from "@services/delivery.service"

export default function MobileHome() {
    const [isLoading, setIsLoading] = useState(true)
    const [todayDeliveries, setTodayDeliveries] = useState(0)
    const [completedDeliveries, setCompletedDeliveries] = useState(0)
    const { user } = useAuth()

    useEffect(() => {
        console.log('User data:', user);
        const fetchTodayData = async () => {
            try {
                // Obter dados do relatório para total de entregas
                const today = new Date()
                const formattedDate = today.toISOString().split('T')[0]
                const data = await reportService.generateReport(formattedDate, formattedDate)

                setTodayDeliveries(data.metrics.totalDeliveries)

                // Buscar todas as entregas e filtrar as concluídas do dia atual
                const allDeliveries = await DeliveryService.getAllDeliveries()
                const todayFormatted = today.toISOString().split('T')[0]

                const todayCompletedCount = allDeliveries.filter(delivery => {
                    const deliveryDate = new Date(delivery.deliveryDate).toISOString().split('T')[0]
                    return deliveryDate === todayFormatted && delivery.status === "delivered"
                }).length

                setCompletedDeliveries(todayCompletedCount)

            } catch (error) {
                console.error("Erro ao buscar dados do dia:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTodayData()
    }, [user])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Painel do Motorista"/>

            <main className="container mx-auto px-4 py-5 flex-grow">
                {/* Perfil do motorista */}
                <section className="mb-5">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Truck className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Olá, {user?.nome || "Usuário"}
                                </h2>
                                <p className="text-sm text-gray-600">Bem-vindo ao seu painel</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resumo do dia */}
                <section className="mb-6">
                    <h3 className="text-base font-bold mb-3 px-1 text-gray-50">Resumo do Dia</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 rounded-full p-2 mb-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                {isLoading ? (
                                    <span className="text-2xl font-bold text-gray-400">...</span>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-800">{todayDeliveries}</span>
                                )}
                                <span className="text-xs text-gray-500">Entregas Hoje</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex flex-col items-center">
                                <div className="bg-green-100 rounded-full p-2 mb-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                                {isLoading ? (
                                    <span className="text-2xl font-bold text-gray-400">...</span>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-800">{completedDeliveries}</span>
                                )}
                                <span className="text-xs text-gray-500">Concluídas</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Botões grandes e fáceis de tocar */}
                <section className="flex-grow">
                    <h3 className="text-base font-bold mb-3 px-1 text-gray-50">Acesso Rápido</h3>
                    <div className="space-y-5">
                        {/* Visualizar painel de entregas */}
                        <Link href="/dashboard" className="block">
                            <div className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 rounded-full p-3 mr-3">
                                        <BarChart3 className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Painel de Entregas</h3>
                                        <p className="text-sm text-gray-500">Visualize suas entregas</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-6 w-6 text-gray-400" />
                            </div>
                        </Link>

                        {/* Rotas recentes */}
                        <Link href="/recent" className="block">
                            <div className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 rounded-full p-3 mr-3">
                                        <Clock className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Rotas Recentes</h3>
                                        <p className="text-sm text-gray-500">Acesse suas rotas</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-6 w-6 text-gray-400" />
                            </div>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    )
}