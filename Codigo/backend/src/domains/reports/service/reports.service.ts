/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Delivery } from '../../deliveries/entity/delivery.entity';
import { DateRangeDto } from '../dto/date-range.dto';
import { DeliveryReport } from '../interfaces/delivery-report.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  // Função para padronizar o formato de data e evitar problemas de timezone
  private normalizeDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Usa UTC para evitar problemas com timezone
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  // Função para extrair o bairro do endereço
  private extractNeighborhood(address: string): string {
    const parts = address.split(',');
    if (parts.length >= 3) {
      return parts[2].trim();
    }
    return 'Desconhecido';
  }

  // Formatar data para o frontend
  private formatDateForChart(date: string): string {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('pt-BR');
  }

  // Função para extrair apenas a primeira palavra do nome do produto
  private extractProductCategory(productName: string): string {
    return productName.split(' ')[0];
  }

  async getReportByDateRange(dateRange: DateRangeDto): Promise<DeliveryReport> {
    const { startDate, endDate } = dateRange;

    // Normaliza as datas
    const normalizedStartDate = this.normalizeDate(startDate);
    const normalizedEndDate = this.normalizeDate(endDate);

    // Buscar todas as entregas no período para processamento
    const deliveries = await this.deliveryRepository.find({
      where: {
        deliveryDate: Between(normalizedStartDate, normalizedEndDate),
      },
      order: {
        deliveryDate: 'ASC',
      },
    });

    // Processar métricas principais
    const totalDeliveries = deliveries.length;
    const totalValue = deliveries.reduce(
      (sum, delivery) => sum + Number(delivery.productValue),
      0,
    );

    // Calcular dias no período
    const days =
      Math.ceil(
        (normalizedEndDate.getTime() - normalizedStartDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    // Processar dados por dia
    const deliveriesByDay = new Map();
    const valueByDay = new Map();

    // Inicializar datas para garantir que todos os dias apareçam, mesmo sem entregas
    let currentDate = new Date(normalizedStartDate);
    while (currentDate <= normalizedEndDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      deliveriesByDay.set(dateStr, 0);
      valueByDay.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Preencher dados reais
    deliveries.forEach((delivery) => {
      const dateStr = new Date(delivery.deliveryDate)
        .toISOString()
        .split('T')[0];

      // Incrementar contagem para o dia
      deliveriesByDay.set(dateStr, (deliveriesByDay.get(dateStr) || 0) + 1);

      // Adicionar valor para o dia
      valueByDay.set(
        dateStr,
        (valueByDay.get(dateStr) || 0) + Number(delivery.productValue),
      );
    });

    // Processar dados por bairro
    const neighborhoodStats = new Map();

    // Processar dados por categoria de produto (primeira palavra)
    const productCategoryStats = new Map();

    deliveries.forEach((delivery) => {
      const neighborhood = this.extractNeighborhood(delivery.deliveryAddress);
      neighborhoodStats.set(
        neighborhood,
        (neighborhoodStats.get(neighborhood) || 0) + 1,
      );

      // Extrair e contar categorias de produtos (primeira palavra do nome)
      const productCategory = this.extractProductCategory(delivery.productName);
      productCategoryStats.set(
        productCategory,
        (productCategoryStats.get(productCategory) || 0) + 1,
      );
    });

    // Ordenar bairros por número de entregas (decrescente) e pegar os top 10
    const sortedNeighborhoods = [...neighborhoodStats.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Ordenar categorias de produtos por quantidade vendida (decrescente) e pegar os top 10
    const sortedProductCategories = [...productCategoryStats.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Processar distribuição de status real
    const statusCounts = new Map();
    deliveries.forEach((delivery) => {
      const status = delivery.status;
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const statusLabels = {
      pending: 'Pendente',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      failed: 'Falhou',
    };

    const statusDistribution = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({
        label: statusLabels[status] || status,
        count,
      }),
    );

    // Dados detalhados para a tabela
    const detailedData = deliveries.map((delivery) => {
      const formatStatus = (status: string): string => {
        const statusMap = {
          pending: 'Pendente',
          delivered: 'Entregue',
          cancelled: 'Cancelado',
          failed: 'Falhou',
        };

        return statusMap[status] || status;
      };

      return {
        date: new Date(delivery.deliveryDate).toLocaleDateString('pt-BR'),
        customer: delivery.customerName,
        product: delivery.productName,
        neighborhood: this.extractNeighborhood(delivery.deliveryAddress),
        value: Number(delivery.productValue),
        // Use o status real formatado para exibição
        status: formatStatus(delivery.status),
      };
    });

    // Montar objeto de resposta no formato esperado pelo frontend
    return {
      period: {
        startDate,
        endDate,
      },
      metrics: {
        totalDeliveries,
        totalValue,
        averageDeliveriesPerDay: totalDeliveries / days,
        averageValuePerDay: totalValue / days,
      },
      charts: {
        deliveriesByDay: {
          labels: Array.from(deliveriesByDay.keys()).map((date) =>
            this.formatDateForChart(date),
          ),
          data: Array.from(deliveriesByDay.values()),
        },
        deliveriesByNeighborhood: {
          labels: sortedNeighborhoods.map(([name]) => name),
          data: sortedNeighborhoods.map(([, count]) => count),
        },
        valueByDay: {
          labels: Array.from(valueByDay.keys()).map((date) =>
            this.formatDateForChart(date),
          ),
          data: Array.from(valueByDay.values()),
        },
        deliveryStatusDistribution: {
          labels: statusDistribution.map((item) => item.label),
          data: statusDistribution.map((item) => item.count),
        },
        // Gráfico de categorias de produtos mais vendidos (primeira palavra)
        topProducts: {
          labels: sortedProductCategories.map(([name]) => name),
          data: sortedProductCategories.map(([, count]) => count),
        },
      },
      detailedData,
    };
  }
}
