/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, User, Lock, UserCog } from "lucide-react"
import Header from "@components/header"
import userService from "../shared/services/user.service"

export default function RegisterUser() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "driver", // "driver" ou "manager"
    })

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const validateForm = () => {
        let valid = true
        const newErrors = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "",
        }

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório"
            valid = false
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = "E-mail é obrigatório"
            valid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "E-mail inválido"
            valid = false
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = "Senha é obrigatória"
            valid = false
        } else if (formData.password.length < 6) {
            newErrors.password = "A senha deve ter pelo menos 6 caracteres"
            valid = false
        }

        // Validate password confirmation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirmação de senha é obrigatória"
            valid = false
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem"
            valid = false
        }

        // Validate role
        if (!formData.role) {
            newErrors.role = "Cargo é obrigatório"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            setIsSubmitting(true)
            setSubmitMessage({ type: "", text: "" })

            try {
                // Mapear os dados do formulário para o formato esperado pelo backend
                const userData = {
                    nome: formData.name,
                    email: formData.email,
                    password: formData.password,
                    cargo: formData.role === "driver" ? "Motorista" : "Gerente"
                }

                // Enviar para o backend através do serviço
                const result = await userService.createUser(userData)

                // Exibir mensagem de sucesso
                setSubmitMessage({
                    type: "success",
                    text: "Usuário cadastrado com sucesso!",
                })

                // Resetar o formulário após o envio
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "driver",
                })
            } catch (error: any) {
                console.error("Erro ao cadastrar usuário:", error)

                // Verificar se é um erro de email já existente
                if (error.response && error.response.status === 409) {
                    setSubmitMessage({
                        type: "error",
                        text: "Este e-mail já está em uso. Por favor, use outro e-mail.",
                    })
                } else {
                    setSubmitMessage({
                        type: "error",
                        text: "Erro ao cadastrar usuário. Por favor, tente novamente.",
                    })
                }
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header title="Cadastro de usuários" />

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center mb-6">
                        <Link href="/home" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            <span>Voltar</span>
                        </Link>
                        <h2 className="text-2xl font-bold">Cadastrar Novo Usuário</h2>
                    </div>

                    {submitMessage.text && (
                        <div
                            className={`mb-6 p-4 rounded-lg ${
                                submitMessage.type === "success"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                        >
                            {submitMessage.text}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                {/* Nome */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Nome</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="Digite o nome completo"
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">E-mail</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="exemplo@email.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                {/* Senha */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="Digite a senha"
                                        />
                                    </div>
                                    {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
                                </div>

                                {/* Confirmar Senha */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Confirmar Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="Confirme a senha"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-red-500 text-sm">{errors.confirmPassword}</p>}
                                </div>

                                {/* Cargo */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Cargo</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserCog className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.role ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white`}
                                        >
                                            <option value="driver">Motorista</option>
                                            <option value="manager">Gerente</option>
                                        </select>
                                    </div>
                                    {errors.role && <p className="mt-1 text-red-500 text-sm">{errors.role}</p>}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                                <Link href="/home">
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? "Cadastrando..." : "Cadastrar Usuário"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                        <h3 className="text-lg font-semibold text-blue-600 mb-2">Informações Importantes</h3>
                        <ul className="list-disc pl-5 text-gray-600 space-y-1">
                            <li>Usuários com cargo de Gerente têm acesso a todas as funcionalidades do sistema</li>
                            <li>Usuários com cargo de Motorista têm acesso limitado às funcionalidades relacionadas a entregas</li>
                            <li>Senhas devem ter no mínimo 6 caracteres</li>
                            <li>Certifique-se de usar um e-mail válido e acessível</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}