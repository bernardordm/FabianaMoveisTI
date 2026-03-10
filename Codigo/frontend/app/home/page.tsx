import Link from "next/link"
import {BarChart3, Clock, FileText, MapPin, Package, Plus, UsersIcon} from "lucide-react"
import Header from "@components/header"

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header title="Painel principal" />

            <main className="container mx-auto px-4 py-8 flex-grow">
                <section className="mb-10 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Register Deliveries Card */}
                        <div className="group relative bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <Plus className="h-7 w-7 text-blue-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-600">Registro de entregas</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Registre aqui as vendas a serem entregues
                                </p>
                                <Link href="/deliveries">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                                        Registrar nova entrega
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* View Dashboard Card */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <BarChart3 className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-600">Painel de entregas</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Acesse o painel semanal de entregas da loja
                                </p>
                                <Link href="/dashboard">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                                        Abrir painel
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Generate Reports Card */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <FileText className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-600">Gerador de relatórios</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Gere relatórios sobre os dados das entregas
                                </p>
                                <Link href="/reports">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                                        Gerar relatório
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Generate Routes Card */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <MapPin className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-600">Gerador de rotas</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Gere as rotas de entregas otimizadas do dia
                                </p>
                                <Link href="/routes">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                                        Criar rotas
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Routes Card */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <Clock className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-600">Rotas recentes</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Visualize e gerencie as rotas mais recentes geradas
                                </p>
                                <Link href="/recent">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                                        Visualizar rotas recentes
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Manage Users Card */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <UsersIcon className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-600">Cadastrar usuário</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    Cadastre novos usuários no sistema de forma segura
                                </p>
                                <Link href="/users">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                                        Cadastrar usuário
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-16 relative">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl p-8 border border-amber-200/50 shadow-lg backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12">
                                    <Package className="h-10 w-10 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-amber-700 mb-1">Registro de funcionários</h3>
                                    <p className="text-amber-600">Consulte e gerencie dados dos funcionários</p>
                                </div>
                            </div>
                            <div>
                                <Link href="/employees">
                                    <button className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
                                        Visualizar perfis
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}