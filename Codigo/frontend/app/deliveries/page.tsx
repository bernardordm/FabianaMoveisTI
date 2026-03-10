/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {ArrowLeft, Calendar, MapPin, Package, User, CheckCircle, FileText} from "lucide-react"
import Header from "@components/header"
import DeliveryService from "../shared/services/delivery.service"

export default function RegisterDelivery() {
    const [formData, setFormData] = useState({
        productName: "",
        customerName: "",
        productValue: "",
        deliveryAddress: "",
        deliveryDate: "",
        observations: "",
    })

    const [errors, setErrors] = useState({
        productName: "",
        customerName: "",
        productValue: "",
        deliveryAddress: "",
        deliveryDate: "",
        observations: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" })
    const [showCopyNotification, setShowCopyNotification] = useState(false)
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === "productValue") {
            const sanitizedValue = value.replace(/[^\d,\.]/g, '')
            setFormData((prev) => ({
                ...prev,
                [name]: sanitizedValue,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
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
            productName: "",
            customerName: "",
            productValue: "",
            deliveryAddress: "",
            deliveryDate: "",
            observations: "",
        }

        if (!formData.productName.trim()) {
            newErrors.productName = "Nome do produto é obrigatório"
            valid = false
        }

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Nome do cliente é obrigatório"
            valid = false
        }

        if (!formData.productValue.trim()) {
            newErrors.productValue = "Valor do produto é obrigatório"
            valid = false
        } else {
            const normalizedValue = formData.productValue.replace(',', '.')
            if (isNaN(Number(normalizedValue))) {
                newErrors.productValue = "Valor deve ser um número"
                valid = false
            }
        }

        if (!formData.deliveryAddress.trim()) {
            newErrors.deliveryAddress = "Endereço de entrega é obrigatório"
            valid = false
        }

        if (!formData.deliveryDate.trim()) {
            newErrors.deliveryDate = "Data de entrega é obrigatória"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.name === "productValue" && e.target.value) {
            try {
                const normalizedValue = e.target.value.replace(',', '.')
                const numValue = parseFloat(normalizedValue)

                if (!isNaN(numValue)) {
                    const formattedValue = numValue.toFixed(2).replace('.', ',')
                    setFormData(prev => ({
                        ...prev,
                        productValue: formattedValue
                    }))
                }
            } catch (error) {
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            setIsSubmitting(true)
            setSubmitMessage({ type: "", text: "" })

            try {
                const normalizedValue = formData.productValue.replace(',', '.')
                const productValueAsNumber = parseFloat(normalizedValue)

                await DeliveryService.createDelivery({
                    productName: formData.productName,
                    customerName: formData.customerName,
                    productValue: productValueAsNumber,
                    deliveryAddress: formData.deliveryAddress,
                    deliveryDate: formData.deliveryDate,
                    observations: formData.observations,
                })

                setSubmitMessage({
                    type: "success",
                    text: "Entrega registrada com sucesso!"
                })

                setShowCopyNotification(true)
                setTimeout(() => setShowCopyNotification(false), 3000)

                setFormData({
                    productName: "",
                    customerName: "",
                    productValue: "",
                    deliveryAddress: "",
                    deliveryDate: "",
                    observations: "",
                })
            } catch (error) {
                console.error("Erro ao registrar entrega:", error)
                setSubmitMessage({
                    type: "error",
                    text: "Erro ao registrar entrega. Por favor, tente novamente."
                })
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header title="Registro de entregas" />

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Link href="/home" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            <span>Voltar</span>
                        </Link>
                        <h2 className="text-2xl font-bold">Registrar Nova Entrega</h2>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nome do Produto */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-gray-700 font-medium mb-2">Nome do Produto</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Package className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.productName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="Digite o nome do produto"
                                        />
                                    </div>
                                    {errors.productName && <p className="mt-1 text-red-500 text-sm">{errors.productName}</p>}
                                </div>

                                {/* Nome do Cliente */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-gray-700 font-medium mb-2">Nome do Cliente</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.customerName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="Digite o nome do cliente"
                                        />
                                    </div>
                                    {errors.customerName && <p className="mt-1 text-red-500 text-sm">{errors.customerName}</p>}
                                </div>

                                {/* Valor do Produto */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-gray-700 font-medium mb-2">Valor do Produto</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-medium">R$</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="productValue"
                                            value={formData.productValue}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.productValue ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="0,00"
                                        />
                                    </div>
                                    {errors.productValue && <p className="mt-1 text-red-500 text-sm">{errors.productValue}</p>}
                                </div>

                                {/* Data de Entrega */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-gray-700 font-medium mb-2">Data de Entrega</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="deliveryDate"
                                            value={formData.deliveryDate}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.deliveryDate ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 date-input`}
                                            style={{ color: formData.deliveryDate ? "#111827" : "#9ca3af" }}
                                            placeholder="dd/mm/aaaa"
                                        />
                                    </div>
                                    {errors.deliveryDate && <p className="mt-1 text-red-500 text-sm">{errors.deliveryDate}</p>}
                                </div>

                                {/* Endereço de Entrega */}
                                <div className="col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2">Endereço de Entrega</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            name="deliveryAddress"
                                            value={formData.deliveryAddress}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`w-full pl-10 pr-3 py-2 border ${errors.deliveryAddress ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900`}
                                            placeholder="Digite o endereço completo de entrega"
                                        />
                                    </div>
                                    {errors.deliveryAddress && <p className="mt-1 text-red-500 text-sm">{errors.deliveryAddress}</p>}
                                </div>

                                {/* Observações */}
                                <div className="col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Observações
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            name="observations"
                                            value={formData.observations}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            placeholder="Adicione informações extras sobre a entrega (horário especial, instruções, etc.)"
                                        />
                                    </div>
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
                                    {isSubmitting ? "Registrando..." : "Registrar Entrega"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                        <h3 className="text-lg font-semibold text-blue-600 mb-2">Dicas para Registro de Entregas</h3>
                        <ul className="list-disc pl-5 text-gray-600 space-y-1">
                            <li>Certifique-se de que o endereço está completo, incluindo CEP</li>
                            <li>Verifique se a data de entrega é um dia útil</li>
                            <li>O valor do produto deve ser inserido sem o símbolo de moeda</li>
                            <li>Certifique-se de incluir o nome completo do cliente</li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Notificação de sucesso */}
            {showCopyNotification && (
                <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center animate-fade-in-up z-50">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Entrega registrada com sucesso!</span>
                </div>
            )}

        </div>
    )
}