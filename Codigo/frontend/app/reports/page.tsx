"use client"

import Header from "../../app/components/header"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { reportService, ReportData } from "@services/report.service"
import html2pdf from "html2pdf.js"
import html2canvas from 'html2canvas'
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Download,
    FileText,
    TrendingUp,
    Truck,
} from "lucide-react"

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value)
}

const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toLocaleDateString("pt-BR");
}

export default function Reports() {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [showReport, setShowReport] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const reportContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        setStartDate(firstDay.toISOString().split('T')[0])
        setEndDate(lastDay.toISOString().split('T')[0])
    }, [])

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) return

        setIsLoading(true)
        try {
            const data = await reportService.generateReport(startDate, endDate)
            setReportData(data)
            setShowReport(true)
        } catch (error) {
            console.error("Erro ao gerar relatório:", error)
            alert("Ocorreu um erro ao gerar o relatório. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }


    const handleExportPDF = async () => {
        if (!reportData || !reportContentRef.current) return;

        try {
            const loadingElement = document.createElement('div');
            loadingElement.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
            loadingElement.innerHTML = '<div class="bg-white p-6 rounded-md shadow-lg flex flex-col items-center"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-3"></div><div class="text-lg font-medium">Gerando PDF, aguarde...</div></div>';
            document.body.appendChild(loadingElement);

            const chartContainers = reportContentRef.current.querySelectorAll('.bg-white.rounded-lg.shadow-md .h-64');
            const chartTitles = ["Entregas por Dia", "Valor das Entregas por Dia", "Bairros com Mais Entregas", "Distribuição de Status"];

            const chartImages = [];

            for (let i = 0; i < chartContainers.length; i++) {
                try {
                    if (chartContainers[i]) {
                        const noDataMessage = chartContainers[i].querySelector('.text-gray-500');

                        if (!noDataMessage) {
                            const canvas = await html2canvas(chartContainers[i] as HTMLElement, {
                                scale: 2,
                                logging: false,
                                useCORS: true,
                                allowTaint: true,
                                backgroundColor: '#ffffff'
                            });

                            const imageData = canvas.toDataURL('image/png');
                            chartImages.push({
                                title: chartTitles[i] || `Gráfico ${i + 1}`,
                                image: imageData
                            });
                        }
                    }
                } catch (err) {
                    console.warn(`Erro ao capturar gráfico ${i + 1}:`, err);
                }
            }

            const pdfContent = document.createElement('div');
            pdfContent.className = 'pdf-export';

            pdfContent.innerHTML = `
            <style>
                .pdf-export {
                    font-family: Arial, sans-serif;
                    color: #333;
                    padding: 20px;
                }
                .pdf-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                .pdf-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e40af;
                    margin-bottom: 5px;
                }
                .pdf-period {
                    font-size: 16px;
                    color: #666;
                }
                .pdf-metrics {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .metric-card {
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 8px;
                }
                .metric-title {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .metric-value {
                    font-size: 20px;
                    font-weight: bold;
                }
                .chart-section {
                    margin-top: 30px;
                    margin-bottom: 30px;
                }
                .chart-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                }
                .charts-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
                .chart-item {
                    margin-bottom: 20px;
                }
                .chart-item-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #1e40af;
                }
                .chart-image {
                    max-width: 100%;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .table-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0 10px;
                    color: #333;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                }
            </style>

            <div class="pdf-header">
                <div class="pdf-title">Relatório de Entregas - Fabiana Móveis</div>
                <div class="pdf-period">Período: ${formatDate(reportData.period.startDate)} a ${formatDate(reportData.period.endDate)}</div>
            </div>

            <div class="pdf-metrics">
                <div class="metric-card">
                    <div class="metric-title">Total de Entregas</div>
                    <div class="metric-value">${reportData.metrics.totalDeliveries}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Valor Total</div>
                    <div class="metric-value">${formatCurrency(reportData.metrics.totalValue)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Média de Entregas por Dia</div>
                    <div class="metric-value">${reportData.metrics.averageDeliveriesPerDay.toFixed(1)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Valor Médio por Dia</div>
                    <div class="metric-value">${formatCurrency(reportData.metrics.averageValuePerDay)}</div>
                </div>
            </div>

            <div class="table-title">Dados Detalhados das Entregas</div>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Produto</th>
                        <th>Bairro</th>
                        <th>Valor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.detailedData && reportData.detailedData.length > 0
                ? reportData.detailedData.slice(0, 15).map(item => `
                            <tr>
                                <td>${item.date}</td>
                                <td>${item.customer}</td>
                                <td>${item.product}</td>
                                <td>${item.neighborhood}</td>
                                <td>${formatCurrency(item.value)}</td>
                                <td>${item.status}</td>
                            </tr>
                        `).join('')
                : '<tr><td colspan="6" style="text-align: center;">Nenhum dado disponível</td></tr>'
            }
                </tbody>
            </table>

            ${chartImages.length > 0 ? `
                <div class="chart-section">
                    <div class="chart-title">Gráficos de Análise</div>
                    <div class="charts-container">
                        ${chartImages.map((chart) => `
                            <div class="chart-item">
                                <div class="chart-item-title">${chart.title}</div>
                                <img class="chart-image" src="${chart.image}" alt="${chart.title}" />
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="footer">
                Relatório gerado automaticamente pelo sistema Fabiana Móveis em ${new Date().toLocaleString('pt-BR')}
            </div>
        `;

            // Configurar opções do PDF
            const options = {
                margin: [15, 15],
                filename: `relatorio-entregas-fabiana-moveis-${reportData.period.startDate}-${reportData.period.endDate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true,
                    putOnlyUsedFonts: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Gerar o PDF
            await html2pdf().from(pdfContent).set(options).save();

            // Remover o indicador de carregamento
            document.body.removeChild(loadingElement);

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");

            // Garantir que o indicador de carregamento seja removido mesmo em caso de erro
            const loadingElement = document.querySelector('.fixed.top-0.left-0.w-full.h-full');
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
        }
    }

    // Componente para a seleção de período
    const PeriodSelectionView = () => (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Selecione o período para o relatório</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Data inicial</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Data final</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={!startDate || !endDate || isLoading}
                    className="w-full mt-6 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70"
                >
                    {isLoading ? "Gerando relatório..." : "Gerar relatório"}
                </button>
            </div>

            <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Informações sobre relatórios</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Os relatórios são gerados com base nas entregas realizadas no período selecionado</li>
                    <li>Você pode exportar os relatórios em formato PDF ou Excel</li>
                    <li>Os gráficos ajudam a visualizar tendências e padrões nas entregas</li>
                    <li>Períodos muito longos podem levar mais tempo para processar</li>
                </ul>
            </div>
        </div>
    )

    const ReportView = () => {
        if (!reportData) return null;

        return (
            <div className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">
                            Relatório de Entregas - {formatDate(reportData.period.startDate)} a{" "}
                            {formatDate(reportData.period.endDate)}
                        </h3>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        className="flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Exportar Relatório
                    </button>
                </div>

                {/* Envolver o conteúdo do relatório em uma div com ref */}
                <div ref={reportContentRef}>
                    {/* Cards de métricas principais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total de Entregas</p>
                                    <h4 className="text-2xl font-bold text-gray-800">{reportData.metrics.totalDeliveries}</h4>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Truck className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                                    <h4 className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.metrics.totalValue)}</h4>
                                </div>
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Média de Entregas por Dia</p>
                                    <h4 className="text-2xl font-bold text-gray-800">
                                        {reportData.metrics.averageDeliveriesPerDay.toFixed(1)}
                                    </h4>
                                </div>
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Valor Médio por Dia</p>
                                    <h4 className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(reportData.metrics.averageValuePerDay)}
                                    </h4>
                                </div>
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Gráfico de Entregas por Dia */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Entregas por Dia</h4>
                            <div className="h-64 flex items-center justify-center">
                                {reportData.charts.deliveriesByDay.labels.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={reportData.charts.deliveriesByDay.labels.map((label, index) => ({
                                                date: label,
                                                entregas: reportData.charts.deliveriesByDay.data[index]
                                            }))}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <RechartsTooltip
                                                formatter={(value: number) => [`${value} entregas`, "Quantidade"]}
                                                labelFormatter={(label: string) => `Data: ${label}`}
                                            />
                                            <Legend />
                                            <Bar dataKey="entregas" fill="#3b82f6" name="Entregas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfico de Valor por Dia - Versão Melhorada */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Valor das Entregas por Dia</h4>
                            <div className="h-64 flex items-center justify-center">
                                {reportData.charts.valueByDay.labels.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={reportData.charts.valueByDay.labels.map((label, index) => ({
                                                date: label,
                                                valor: reportData.charts.valueByDay.data[index]
                                            }))}
                                            margin={{ top: 20, right: 30, left: 40, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" padding={{ left: 10, right: 10 }} />
                                            <YAxis
                                                tickFormatter={(value) => {
                                                    if (value >= 1000) {
                                                        return `R$${(value/1000).toFixed(1)}k`;
                                                    }
                                                    return `R$${Math.round(value)}`;
                                                }}
                                                domain={[0, 'dataMax + 1000']}
                                                padding={{ top: 20, bottom: 20 }}
                                            />
                                            <RechartsTooltip
                                                formatter={(value: number) => [
                                                    new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(value),
                                                    "Valor"
                                                ]}
                                                labelFormatter={(label: string) => `Data: ${label}`}
                                                contentStyle={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                            <Line
                                                type="monotone"
                                                dataKey="valor"
                                                stroke="#22c55e"
                                                strokeWidth={3}
                                                activeDot={{ r: 8 }}
                                                name="Valor Total"
                                                dot={{ stroke: '#22c55e', strokeWidth: 2, fill: '#ffffff', r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfico de Entregas por Bairro - Versão Melhorada */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Bairros com Mais Entregas</h4>
                            <div className="h-64 flex items-center justify-center">
                                {reportData.charts.deliveriesByNeighborhood.labels.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={reportData.charts.deliveriesByNeighborhood.labels.map((label, index) => ({
                                                bairro: label,
                                                entregas: reportData.charts.deliveriesByNeighborhood.data[index]
                                            })).slice(0, 10)} // Aumentado para 10 bairros
                                            margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} />
                                            <XAxis
                                                type="number"
                                                domain={[0, 'dataMax + 1']}
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="bairro"
                                                tickMargin={10}
                                                tickLine={false}
                                                axisLine={true}
                                                width={80}
                                                tick={{ fontSize: 11 }}
                                            />
                                            <RechartsTooltip
                                                formatter={(value: number) => [`${value} entregas`, "Quantidade"]}
                                                labelFormatter={(label: string) => `Bairro: ${label}`}
                                                contentStyle={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                            <Bar
                                                dataKey="entregas"
                                                fill="#eab308"
                                                name="Entregas"
                                                radius={[0, 4, 4, 0]}
                                                barSize={24}
                                                label={{ position: 'right', formatter: (value: never) => value, fontSize: 11 }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfico de Produtos Mais Vendidos */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Produtos Mais Vendidos</h4>
                            <div className="h-64 flex items-center justify-center">
                                {reportData.charts.topProducts && reportData.charts.topProducts.labels.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={reportData.charts.topProducts.labels.map((label, index) => ({
                                                produto: label,
                                                quantidade: reportData.charts.topProducts.data[index]
                                            }))}
                                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis
                                                type="number"
                                                domain={[0, 'dataMax + 1']}
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="produto"
                                                width={100}
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={true}
                                            />
                                            <RechartsTooltip
                                                formatter={(value: number) => [`${value} unidades`, "Vendidos"]}
                                                labelFormatter={(label: string) => `Produto: ${label}`}
                                                contentStyle={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                            <Bar
                                                dataKey="quantidade"
                                                fill="#8884d8"
                                                name="Quantidade"
                                                radius={[0, 4, 4, 0]}
                                                barSize={20}
                                                label={{ position: 'right', formatter: (value: never) => value, fontSize: 11 }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabela de dados detalhados */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-800">Dados Detalhados</h4>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Data
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Cliente
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Produto
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Bairro
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Valor
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.detailedData && reportData.detailedData.length > 0 ? (
                                        reportData.detailedData.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.customer}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.product}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.neighborhood}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCurrency(item.value)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === "Entregue"
                                                            ? "bg-green-100 text-green-800"
                                                            : item.status === "Em rota"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Nenhum dado disponível para o período selecionado
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Header title="Relatórios" />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <Link href="/home" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            <span>Voltar</span>
                        </Link>
                        <h2 className="text-2xl font-bold">Relatórios</h2>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-pulse text-blue-600">Carregando relatório...</div>
                    </div>
                ) : showReport ? (
                    <ReportView />
                ) : (
                    <PeriodSelectionView />
                )}
            </main>

        </div>
    )
}
