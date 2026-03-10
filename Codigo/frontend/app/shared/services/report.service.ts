/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface ReportData {
    period: {
        startDate: string;
        endDate: string;
    };
    metrics: {
        totalDeliveries: number;
        totalValue: number;
        averageDeliveriesPerDay: number;
        averageValuePerDay: number;
    };
    charts: {
        deliveriesByDay: {
            labels: string[];
            data: number[];
        };
        deliveriesByNeighborhood: {
            labels: string[];
            data: number[];
        };
        valueByDay: {
            labels: string[];
            data: number[];
        };
        deliveryStatusDistribution: {
            labels: string[];
            data: number[];
        };
        topProducts: { // Add this new property
            labels: string[];
            data: number[];
        };
    };
    detailedData: Array<{
        date: string;
        customer: string;
        product: string;
        neighborhood: string;
        value: number;
        status: string;
    }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Função para corrigir as datas nos dados detalhados
const fixDetailedDataDates = (data: any) => {
    if (data.detailedData && data.detailedData.length > 0) {
        return data.detailedData.map((item: any) => {
            // Se a data estiver no formato dd/mm/yyyy
            if (item.date.includes('/')) {
                const parts = item.date.split('/');
                // Corrigir adicionando +1 ao dia
                let day = parseInt(parts[0]) + 1;
                let month = parseInt(parts[1]);
                let year = parseInt(parts[2]);

                // Ajustar caso o dia ultrapasse o limite do mês
                const daysInMonth = new Date(year, month, 0).getDate();
                if (day > daysInMonth) {
                    day = 1;
                    month += 1;
                    if (month > 12) {
                        month = 1;
                        year += 1;
                    }
                }

                return {
                    ...item,
                    date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
                };
            }
            return item;
        });
    }
    return data.detailedData;
};



// Função para corrigir as datas em todos os gráficos
const fixChartDates = (data: any) => {
    // Função auxiliar para formatar a data
    const formatCorrectDate = (dateStr: string) => {
        // Se a data já estiver no formato dd/mm/yyyy
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            // Corrigir adicionando +1 ao dia
            let day = parseInt(parts[0]) + 1;
            let month = parseInt(parts[1]);
            let year = parseInt(parts[2]);

            // Ajustar caso o dia ultrapasse o limite do mês
            const daysInMonth = new Date(year, month, 0).getDate();
            if (day > daysInMonth) {
                day = 1;
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            }

            return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        }
        return dateStr;
    };

    // Corrigir datas nos gráficos
    if (data.charts) {
        // Corrigir entregas por dia
        if (data.charts.deliveriesByDay && data.charts.deliveriesByDay.labels) {
            data.charts.deliveriesByDay.labels = data.charts.deliveriesByDay.labels.map(formatCorrectDate);
        }

        // Corrigir valor por dia
        if (data.charts.valueByDay && data.charts.valueByDay.labels) {
            data.charts.valueByDay.labels = data.charts.valueByDay.labels.map(formatCorrectDate);
        }
    }

    return data;
};

export const reportService = {
    async generateReport(startDate: string, endDate: string): Promise<ReportData> {
        try {
            const response = await axios.post(`${API_URL}/reports/by-date-range`, {
                startDate,
                endDate
            });

            let data = response.data;

            // Garantir que as datas no período são as corretas
            data.period.startDate = startDate;
            data.period.endDate = endDate;

            // Corrigir as datas nos dados detalhados
            if (data.detailedData) {
                data.detailedData = fixDetailedDataDates(data);
            }

            // Corrigir as datas nos gráficos
            data = fixChartDates(data);

            return data;
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw new Error('Não foi possível gerar o relatório. Tente novamente mais tarde.');
        }
    },

    async exportReport(reportData: ReportData, format: 'pdf' | 'excel'): Promise<Blob> {
        try {
            // Esta função seria implementada posteriormente quando o backend suportar exportação
            const response = await axios.post(`${API_URL}/reports/export`, {
                reportData,
                format
            }, {
                responseType: 'blob'
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            throw new Error('Não foi possível exportar o relatório. Tente novamente mais tarde.');
        }
    }
};