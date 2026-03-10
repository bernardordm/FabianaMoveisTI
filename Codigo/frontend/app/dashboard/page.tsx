"use client"

import React, { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    MapPin,
    Save,
    Trash2,
    X,
    FileText
} from "lucide-react"
import Header from "@components/header"
import DeliveryService from "../shared/services/delivery.service"

type Delivery = {
    id: number;
    productName: string;
    customerName: string;
    productValue: number;
    deliveryAddress: string;
    deliveryDate: string;
    status?: "pending" | "delivered" | "canceled";
    observations?: string;
}

const getStatusBadgeClass = (status?: string) => {
    switch (status) {
        case "delivered":
            return "bg-green-100 text-green-800 border-green-200";
        case "canceled":
            return "bg-red-100 text-red-800 border-red-200";
        case "pending":
        default:
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
};

const getStatusText = (status?: string) => {
    switch (status) {
        case "delivered":
            return "Entregue";
        case "canceled":
            return "Cancelada";
        case "pending":
        default:
            return "Pendente";
    }
};

interface EditModalProps {
    selectedDelivery: Delivery | null;
    showModal: boolean;
    isEditing: boolean;
    deleteMessage: { type: string; text: string };
    editMessage: { type: string; text: string };
    isDeleting: boolean;
    isSaving: boolean;
    onClose: () => void;
    onToggleEdit: () => void;
    onSave: (formData: {
        productName: string;
        customerName: string;
        productValue: number;
        deliveryAddress: string;
        deliveryDate: string;
        observations: string;
    }) => void;
    onDelete: () => void;
}

// eslint-disable-next-line react/display-name
const EditModal = memo<EditModalProps>(({
                                            selectedDelivery,
                                            showModal,
                                            isEditing,
                                            deleteMessage,
                                            editMessage,
                                            isDeleting,
                                            isSaving,
                                            onClose,
                                            onToggleEdit,
                                            onSave,
                                            onDelete
                                        }) => {
    const [formData, setFormData] = useState({
        productName: "",
        customerName: "",
        productValue: 0,
        deliveryAddress: "",
        deliveryDate: "",
        observations: ""
    })

    useEffect(() => {
        if (selectedDelivery) {
            setFormData({
                productName: selectedDelivery.productName,
                customerName: selectedDelivery.customerName,
                productValue: selectedDelivery.productValue,
                deliveryAddress: selectedDelivery.deliveryAddress,
                deliveryDate: selectedDelivery.deliveryDate,
                observations: selectedDelivery.observations || ""
            })
        }
    }, [selectedDelivery?.id, isEditing])

    const handleInputChange = useCallback((field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'productValue' ? (parseFloat(value) || 0) : value
        }))
    }, [])

    const handleSaveClick = useCallback(() => {
        onSave(formData)
    }, [formData, onSave])

    if (!showModal || !selectedDelivery) return null

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {isEditing ? "Editar Entrega" : "Detalhes da Entrega"}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5"/>
                    </button>
                </div>

                <div className="p-5">
                    {deleteMessage.text && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            deleteMessage.type === "success"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                            {deleteMessage.text}
                        </div>
                    )}

                    {editMessage.text && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            editMessage.type === "success"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                            {editMessage.text}
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* Status */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Status</h4>
                            <div className="mt-1">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full inline-block ${getStatusBadgeClass(selectedDelivery.status)}`}>
                                    {getStatusText(selectedDelivery.status)}
                                </span>
                            </div>
                        </div>

                        {/* Produto */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Produto</h4>
                            {isEditing ? (
                                <input
                                    key="productName-input" // KEY ÚNICA!
                                    type="text"
                                    value={formData.productName}
                                    onChange={(e) => handleInputChange('productName', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    autoComplete="off"
                                />
                            ) : (
                                <p className="text-base font-semibold text-gray-900">{selectedDelivery.productName}</p>
                            )}
                        </div>

                        {/* Cliente */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Cliente</h4>
                            {isEditing ? (
                                <input
                                    key="customerName-input" // KEY ÚNICA!
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    autoComplete="off"
                                />
                            ) : (
                                <p className="text-base font-semibold text-gray-900">{selectedDelivery.customerName}</p>
                            )}
                        </div>

                        {/* Valor */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Valor</h4>
                            {isEditing ? (
                                <input
                                    key="productValue-input"
                                    type="number"
                                    step="0.01"
                                    value={formData.productValue}
                                    onChange={(e) => handleInputChange('productValue', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    autoComplete="off"
                                />
                            ) : (
                                <p className="text-base font-semibold text-blue-600">
                                    R$ {Number(selectedDelivery.productValue).toFixed(2)}
                                </p>
                            )}
                        </div>

                        {/* Endereço */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Endereço de Entrega</h4>
                            {isEditing ? (
                                <input
                                    key="deliveryAddress-input" // KEY ÚNICA!
                                    type="text"
                                    value={formData.deliveryAddress}
                                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    autoComplete="off"
                                />
                            ) : (
                                <p className="text-sm text-gray-900">{selectedDelivery.deliveryAddress}</p>
                            )}
                        </div>

                        {/* Data */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Data de Entrega</h4>
                            {isEditing ? (
                                <input
                                    key="deliveryDate-input" // KEY ÚNICA!
                                    type="date"
                                    value={formData.deliveryDate}
                                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                            ) : (
                                <p className="text-sm text-gray-900 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-500"/>
                                    {selectedDelivery.deliveryDate.split('-').reverse().join('/')}
                                </p>
                            )}
                        </div>

                        {/* Observações */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500">Observações</h4>
                            {isEditing ? (
                                <textarea
                                    key="observations-input" // KEY ÚNICA!
                                    value={formData.observations}
                                    onChange={(e) => handleInputChange('observations', e.target.value)}
                                    rows={3}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    placeholder="Adicione observações sobre a entrega..."
                                />
                            ) : (
                                <div className="mt-1">
                                    {selectedDelivery.observations ? (
                                        <p className="text-sm text-gray-900 flex items-start">
                                            <FileText className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0"/>
                                            <span>{selectedDelivery.observations}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Nenhuma observação adicionada</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Botões */}
                        <div className="pt-4 mt-2 border-t border-gray-200 flex space-x-2">
                            {isEditing ? (
                                <button
                                    onClick={handleSaveClick}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4 mr-2"/>
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            ) : (
                                <button
                                    onClick={onToggleEdit}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="h-4 w-4 mr-2"/>
                                    Editar Entrega
                                </button>
                            )}

                            <button
                                onClick={isEditing ? onToggleEdit : onDelete}
                                disabled={isDeleting}
                                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm rounded-md transition-colors ${
                                    isEditing
                                        ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                        : "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                }`}
                            >
                                {isEditing ? (
                                    <>
                                        <X className="h-4 w-4 mr-2"/>
                                        Cancelar
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2"/>
                                        {isDeleting ? "Excluindo..." : "Excluir Entrega"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default function DeliveryDashboard() {

    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const today = new Date()
        const day = today.getDay()

        const diff = day === 0
            ? 1
            : 1 - day

        const monday = new Date(today)
        monday.setDate(today.getDate() + diff)
        return monday
    })

    const [deliveries, setDeliveries] = useState<Delivery[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteMessage, setDeleteMessage] = useState({type: "", text: ""})
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editMessage, setEditMessage] = useState({type: "", text: ""})

    useEffect(() => {
        const fetchDeliveries = async () => {
            setIsLoading(true)
            try {
                const data = await DeliveryService.getDeliveriesForDashboard()
                setDeliveries(data)
            } catch (error) {
                console.error("Erro ao carregar entregas:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDeliveries()
    }, [])

    const openDeliveryDetails = useCallback((delivery: Delivery) => {
        setSelectedDelivery(delivery)
        setShowModal(true)
        setDeleteMessage({type: "", text: ""})
        setEditMessage({type: "", text: ""})
        setIsEditing(false)
    }, [])

    const closeModal = useCallback(() => {
        setShowModal(false)
        setSelectedDelivery(null)
        setDeleteMessage({type: "", text: ""})
        setEditMessage({type: "", text: ""})
        setIsEditing(false)
    }, [])

    const handleDeleteDelivery = useCallback(async () => {
        if (!selectedDelivery) return

        setIsDeleting(true)
        setDeleteMessage({type: "", text: ""})

        try {
            const success = await DeliveryService.removeDelivery(selectedDelivery.id)

            if (success) {
                setDeleteMessage({
                    type: "success",
                    text: "Entrega excluída com sucesso!"
                })

                setDeliveries(prev => prev.filter(d => d.id !== selectedDelivery.id))

                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                setDeleteMessage({
                    type: "error",
                    text: "Erro ao excluir entrega. Tente novamente."
                })
            }
        } catch (error) {
            console.error("Erro ao excluir entrega:", error)
            setDeleteMessage({
                type: "error",
                text: "Erro ao excluir entrega. Tente novamente."
            })
        } finally {
            setIsDeleting(false)
        }
    }, [selectedDelivery, closeModal])

    const toggleEditMode = useCallback(() => {
        setIsEditing(prev => !prev)
        setEditMessage({type: "", text: ""})
    }, [])

    const handleSaveChanges = useCallback(async (formData: {
        productName: string;
        customerName: string;
        productValue: number;
        deliveryAddress: string;
        deliveryDate: string;
        observations: string;
    }) => {
        if (!selectedDelivery) return

        setIsSaving(true)
        setEditMessage({type: "", text: ""})

        try {
            const updatedDelivery = await DeliveryService.updateDelivery(selectedDelivery.id, formData)

            if (updatedDelivery) {
                setEditMessage({
                    type: "success",
                    text: "Entrega atualizada com sucesso!"
                })

                setDeliveries(prev => prev.map(d =>
                    d.id === updatedDelivery.id ? updatedDelivery : d
                ))

                setSelectedDelivery(updatedDelivery)
                setIsEditing(false)

                setTimeout(() => {
                    setEditMessage({type: "", text: ""})
                }, 3000)
            } else {
                setEditMessage({
                    type: "error",
                    text: "Erro ao atualizar entrega. Tente novamente."
                })
            }
        } catch (error) {
            console.error("Erro ao atualizar entrega:", error)
            setEditMessage({
                type: "error",
                text: "Erro ao atualizar entrega. Tente novamente."
            })
        } finally {
            setIsSaving(false)
        }
    }, [selectedDelivery])

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentWeekStart(newDate)
    }

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentWeekStart(newDate)
    }

    const weekDays = Array.from({length: 6}, (_, i) => {
        const date = new Date(currentWeekStart)
        date.setDate(date.getDate() + i)
        return date
    })

    const formatDate = (date: Date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return "--/--"
        }
        return date.toLocaleDateString("pt-BR", {day: "2-digit", month: "2-digit"})
    }

    const getDayName = (date: Date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return "---"
        }
        return date.toLocaleDateString("pt-BR", {weekday: "short"}).replace(".", "")
    }

    const isToday = (date: Date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return false
        }
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    const getDeliveriesForDay = (date: Date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return []
        }

        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return deliveries.filter((delivery) => {
            const [deliveryYear, deliveryMonth, deliveryDay] = delivery.deliveryDate.split('-').map(Number);
            return deliveryYear === year && (deliveryMonth - 1) === month && deliveryDay === day;
        });
    }

    const MobileView = () => {
        const [selectedDay, setSelectedDay] = useState<Date>(new Date())

        useEffect(() => {
            const today = new Date()
            const dayInCurrentWeek = weekDays.find(
                (day) =>
                    day.getDate() === today.getDate() &&
                    day.getMonth() === today.getMonth() &&
                    day.getFullYear() === today.getFullYear(),
            )
            setSelectedDay(dayInCurrentWeek || weekDays[0])
        }, [weekDays])

        return (
            <div className="md:hidden">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={goToPreviousWeek} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeft className="h-5 w-5 text-blue-600"/>
                    </button>
                    <div className="text-center">
                        <h3 className="font-medium text-gray-700">
                            {formatDate(weekDays[0])} - {formatDate(weekDays[5])}
                        </h3>
                    </div>
                    <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronRight className="h-5 w-5 text-blue-600"/>
                    </button>
                </div>

                <div className="flex overflow-x-auto pb-2 mb-4">
                    {weekDays.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDay(day)}
                            className={`flex-shrink-0 flex flex-col items-center p-2 mx-1 rounded-lg ${
                                isToday(day)
                                    ? "bg-blue-600 text-white"
                                    : selectedDay.getDate() === day.getDate() && selectedDay.getMonth() === day.getMonth()
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            <span className="text-xs font-medium">{getDayName(day)}</span>
                            <span className="text-lg font-bold">{day.getDate()}</span>
                        </button>
                    ))}
                </div>

                <h3 className="font-bold text-lg mb-3">
                    {getDayName(selectedDay)}, {formatDate(selectedDay)}
                </h3>

                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-pulse text-blue-600">Carregando...</div>
                        </div>
                    ) : (
                        <>
                            {getDeliveriesForDay(selectedDay).length === 0 ? (
                                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                                    Nenhuma entrega agendada para este dia
                                </div>
                            ) : (
                                getDeliveriesForDay(selectedDay).map((delivery) => (
                                    <div
                                        key={delivery.id}
                                        className={`bg-white rounded-lg shadow border ${
                                            delivery.status === "delivered"
                                                ? "border-green-200"
                                                : delivery.status === "canceled"
                                                    ? "border-red-200"
                                                    : "border-gray-200"
                                        } p-4 cursor-pointer hover:shadow-md transition-shadow`}
                                        onClick={() => openDeliveryDetails(delivery)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-800">{delivery.productName}</h4>
                                            <span className="text-sm text-blue-600 font-medium">
                                                R$ {Number(delivery.productValue).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1 flex items-center">
                                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0"/>
                                            <span className="truncate">{delivery.deliveryAddress}</span>
                                        </div>
                                        <div className="text-sm text-gray-700 mb-1">
                                            Cliente: {delivery.customerName}
                                        </div>
                                        {delivery.observations && (
                                            <div className="text-sm text-gray-600 mb-1 flex items-start">
                                                <FileText className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5"/>
                                                <span className="truncate">{delivery.observations}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-sm text-gray-600 flex items-center">
                                                <Clock className="h-4 w-4 mr-1 flex-shrink-0"/>
                                                {delivery.deliveryDate.split('-').reverse().join('/')}
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                                                {getStatusText(delivery.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    // Modificado grid-cols-7 para grid-cols-6
    const DesktopView = () => (
        <div className="hidden md:block">
            <div className="grid grid-cols-6 gap-4">
                {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex flex-col h-full">
                        <div
                            className={`text-center p-2 rounded-t-lg font-medium ${
                                isToday(day) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            <div className="text-sm">{getDayName(day)}</div>
                            <div className="text-lg font-bold">{day.getDate()}</div>
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-b-lg p-2 min-h-[500px] max-h-[calc(100vh-220px)] overflow-y-auto">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-pulse text-blue-600">Carregando...</div>
                                </div>
                            ) : (
                                <>
                                    {getDeliveriesForDay(day).length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-sm text-gray-500">Sem entregas</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {getDeliveriesForDay(day).map((delivery) => (
                                                <div
                                                    key={delivery.id}
                                                    className={`bg-white rounded-lg shadow-sm border ${
                                                        delivery.status === "delivered"
                                                            ? "border-green-200"
                                                            : delivery.status === "canceled"
                                                                ? "border-red-200"
                                                                : "border-gray-200"
                                                    } p-3 cursor-pointer hover:shadow-md transition-shadow`}
                                                    onClick={() => openDeliveryDetails(delivery)}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-gray-800 text-sm">{delivery.productName}</h4>
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            R$ {Number(delivery.productValue).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-1 flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0"/>
                                                        <span className="truncate">{delivery.deliveryAddress}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-700 mb-1">
                                                        Cliente: {delivery.customerName}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-gray-600 flex items-center">
                                                            <Clock className="h-3 w-3 mr-1 flex-shrink-0"/>
                                                            {delivery.deliveryDate.split('-').reverse().join('/')}
                                                        </div>
                                                        <span
                                                            className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                                                            {getStatusText(delivery.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header title="Painel de entregas semanais"/>

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <Link href="/home" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="h-5 w-5 mr-1"/>
                            <span>Voltar</span>
                        </Link>
                        <h2 className="text-2xl font-bold">Painel de Entregas</h2>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2"/>
                            <h3 className="font-medium text-gray-700">
                                Semana de {formatDate(weekDays[0])} a {formatDate(weekDays[5])}
                            </h3>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={goToPreviousWeek}
                                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1"/>
                                <span className="hidden sm:inline">Semana Anterior</span>
                            </button>
                            <button
                                onClick={goToNextWeek}
                                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                <span className="hidden sm:inline">Próxima Semana</span>
                                <ArrowRight className="h-4 w-4 ml-1"/>
                            </button>
                        </div>
                    </div>
                </div>

                <MobileView/>

                <DesktopView/>

                <EditModal
                    selectedDelivery={selectedDelivery}
                    showModal={showModal}
                    isEditing={isEditing}
                    deleteMessage={deleteMessage}
                    editMessage={editMessage}
                    isDeleting={isDeleting}
                    isSaving={isSaving}
                    onClose={closeModal}
                    onToggleEdit={toggleEditMode}
                    onSave={handleSaveChanges}
                    onDelete={handleDeleteDelivery}
                />
            </main>
        </div>
    )
}