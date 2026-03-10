"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UserPlus, Pencil, Trash2, AlertTriangle } from "lucide-react"
import Header from "../../app/components/header"
import EmployeeService, { Employee } from "../shared/services/employee.service"

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [employeeToDelete, setEmployeeToDelete] = useState<{id: number, nome: string} | null>(null)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setIsLoading(true)
                const data = await EmployeeService.getAllEmployees()
                setEmployees(data)
                setError(null)
            } catch (err) {
                setError("Erro ao carregar funcionários. Tente novamente mais tarde.")
                console.error("Erro ao buscar funcionários:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEmployees()
    }, [])

    const openDeleteModal = (id: number, nome: string) => {
        setEmployeeToDelete({ id, nome })
    }

    const closeDeleteModal = () => {
        setEmployeeToDelete(null)
    }

    const handleDelete = async () => {
        if (!employeeToDelete) return

        try {
            const success = await EmployeeService.deleteEmployee(employeeToDelete.id)
            if (success) {
                setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id))
                closeDeleteModal()
            } else {
                throw new Error("Falha ao excluir funcionário")
            }
        } catch (err) {
            console.error("Erro ao excluir funcionário:", err)
        }
    }

    const formatRole = (cargo: string) => {
        if (cargo.toLowerCase() === "driver") return "Motorista"
        if (cargo.toLowerCase() === "manager") return "Gerente"
        return cargo
    }

    return (
        <div className="min-h-screen bg-white">
            <Header title="Funcionários" />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Funcionários</h1>
                    <Link
                        href="/users"
                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center"
                    >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Novo Funcionário
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-pulse text-blue-600">Carregando...</div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">Nenhum funcionário cadastrado.</p>
                        <Link
                            href="/employees/new"
                            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors inline-flex items-center"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Adicionar Funcionário
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cargo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{employee.nome}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-500">{employee.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-500">{formatRole(employee.cargo)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={`/employees/${employee.id}`}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(employee.id, employee.nome)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal de confirmação de exclusão com fundo borrado */}
                {employeeToDelete && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-200">
                            <div className="flex items-center justify-center mb-4 text-red-500">
                                <AlertTriangle size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Confirmar Exclusão</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Tem certeza que deseja excluir o funcionário <span className="font-semibold">{employeeToDelete.nome}</span>?
                                <br />
                                <span className="text-sm">Esta ação não pode ser desfeita.</span>
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={closeDeleteModal}
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