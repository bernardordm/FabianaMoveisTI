/* eslint-disable */
export interface DeliveryReport {
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
    // Novo campo para produtos mais vendidos
    topProducts: {
      labels: string[];
      data: number[];
    };
  };
  detailedData?: {
    date: string;
    customer: string;
    product: string;
    neighborhood: string;
    value: number;
    status: string;
  }[];
}