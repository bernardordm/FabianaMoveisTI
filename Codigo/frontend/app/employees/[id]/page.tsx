"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {ArrowLeft, Mail, UserCog, Lock, Save, Trash2, AlertTriangle} from "lucide-react"
import Header from "../../../app/components/header"
import Footer from "../../../app/components/footer"
import UserService from "../../shared/services/user.service"

export default function EmployeeProfile() {
    const params = useParams()
    const router = useRouter()
    const employeeId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        password: "",
        cargo: "" as string,
    })

    useEffect(() => {
        const fetchEmployeeData = async () => {
            setIsLoading(true)
            try {
                const userData = await UserService.getUserById(Number(employeeId))

                if (userData) {
                    setFormData({
                        nome: userData.nome,
                        email: userData.email,
                        password: "", // Senha vazia para não exibir a senha atual
                        cargo: userData.cargo
                    })
                } else {
                    alert("Funcionário não encontrado!")
                    router.push("/employees")
                }
            } catch (error) {
                console.error("Erro ao buscar dados do funcionário:", error)
                alert("Erro ao carregar dados do funcionário")
            } finally {
                setIsLoading(false)
            }
        }

        fetchEmployeeData()
    }, [employeeId, router])

    // Função para lidar com alterações nos campos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Adicione este estado ao início do componente junto com os outros estados
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

// Modifique a função handleSave para usar a mensagem personalizada
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const dataToSend = { ...formData } as Partial<typeof formData>;

            if (!dataToSend.password) {
                delete dataToSend.password;
            }

            await UserService.updateUser(Number(employeeId), dataToSend);
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
                router.push("/employees");
            }, 3000);
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            alert("Erro ao salvar alterações. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    }

    // Função para excluir o funcionário
    const handleDelete = async () => {
        try {
            const success = await UserService.removeUser(Number(employeeId))
            if (success) {
                alert("Funcionário excluído com sucesso!")
                router.push("/employees")
            } else {
                throw new Error("Falha ao excluir funcionário")
            }
        } catch (error) {
            console.error("Erro ao excluir funcionário:", error)
            alert("Erro ao excluir funcionário. Tente novamente.")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header title="Perfil do Funcionário" />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex justify-center py-20">
                        <div className="animate-pulse text-blue-600">Carregando...</div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Header title="Perfil do Funcionário" />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <Link href="/employees" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            <span>Voltar para lista</span>
                        </Link>
                        <h2 className="text-2xl font-bold">Perfil do Funcionário</h2>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSave} className="max-w-md mx-auto">
                        <div className="space-y-6">
                            {/* Nome */}
                            <div>
                                <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Nome completo"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="flex items-center text-gray-700 font-medium mb-2">
                                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label htmlFor="password" className="flex items-center text-gray-700 font-medium mb-2">
                                    <Lock className="h-4 w-4 mr-2 text-blue-600" />
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Digite a nova senha"
                                />
                                <p className="mt-1 text-sm text-gray-500">Deixe em branco para manter a senha atual</p>
                            </div>

                            {/* Cargo */}
                            <div>
                                <label htmlFor="cargo" className="flex items-center text-gray-700 font-medium mb-2">
                                    <UserCog className="h-4 w-4 mr-2 text-blue-600" />
                                    Cargo
                                </label>
                                <select
                                    id="cargo"
                                    name="cargo"
                                    value={formData.cargo}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                    required
                                >
                                    <option value="driver">Motorista</option>
                                    <option value="manager">Gerente</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Funcionário
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mensagem de sucesso */}
                {showSuccessMessage && (
                    <div className="fixed top-20 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md animate-fade-in-down max-w-md z-50">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Alterações salvas com sucesso!</span>
                        </div>
                    </div>
                )}

                {/* Modal de confirmação de exclusão com fundo borrado */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-200">
                            <div className="flex items-center justify-center mb-4 text-red-500">
                                <AlertTriangle size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Confirmar Exclusão</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Tem certeza que deseja excluir este funcionário?
                                <br />
                                <span className="text-sm">Esta ação não pode ser desfeita.</span>
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}