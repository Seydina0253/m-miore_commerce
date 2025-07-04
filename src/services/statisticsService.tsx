import axios from 'axios';

export interface SalesStatsData {
  monthlySales: { month: string; sales: number }[];
  topProducts: { name: string; sales: number }[];
  recentPayments: {
    id: string;
    date: string;
    amount: number;
    method: string;
    status: string;
  }[];
}

export interface StatisticsData {
  totalSales: number;
  averageOrderValue: number;
  totalProducts: number;
  conversionRate: number;
}

export const fetchStatisticsData = async (): Promise<StatisticsData> => {
  try {
    // Fetch daily statistics like dashboard
    const response = await fetch('http://localhost/Backend_Mem/dashboard.php?stats=true&daily=true');
    const data = await response.json();
    
    // Calculate average order value
    const averageOrderValue = data.ordersCount > 0 
      ? data.totalSales / data.ordersCount 
      : 0;
    
    // For conversion rate, we'll use a mock value (typically this would come from analytics)
    // In a real application, you'd calculate this based on visitors vs. orders
    const conversionRate = 8.5;
    
    return {
      totalSales: data.totalSales,
      averageOrderValue: averageOrderValue,
      totalProducts: data.productsCount,
      conversionRate: conversionRate
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new Error("Impossible de charger les statistiques");
  }
};

export const fetchSalesChartData = async (): Promise<SalesStatsData['monthlySales']> => {
  try {
    const response = await axios.get('http://localhost/Backend_Mem/statistics.php?monthlySales=true');
    return response.data.monthlySales;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de ventes mensuelles:', error);
    // Return mock data as fallback
    return [
      { month: "Jan", sales: 4000 },
      { month: "Fév", sales: 3000 },
      { month: "Mar", sales: 5000 },
      { month: "Avr", sales: 2780 },
      { month: "Mai", sales: 1890 },
      { month: "Juin", sales: 2390 },
      { month: "Juil", sales: 3490 },
      { month: "Août", sales: 4000 },
      { month: "Sept", sales: 2500 },
      { month: "Oct", sales: 6000 },
      { month: "Nov", sales: 7000 },
      { month: "Déc", sales: 9000 },
    ];
  }
};

export const fetchTopProductsData = async (): Promise<SalesStatsData['topProducts']> => {
  try {
    const response = await axios.get('http://localhost/Backend_Mem/statistics.php?topProducts=true');
    return response.data.topProducts;
  } catch (error) {
    console.error('Erreur lors de la récupération des données des meilleurs produits:', error);
    // Return mock data as fallback
    return [
      { name: "Produit A", sales: 400 },
      { name: "Produit B", sales: 300 },
      { name: "Produit C", sales: 290 },
      { name: "Produit D", sales: 200 },
      { name: "Produit E", sales: 180 },
    ];
  }
};

export const fetchRecentPaymentsData = async (): Promise<SalesStatsData['recentPayments']> => {
  try {
    const response = await axios.get('http://localhost/Backend_Mem/statistics.php?recentPayments=true');
    return response.data.payments;
  } catch (error) {
    console.error('Erreur lors de la récupération des données des paiements récents:', error);
    // Return mock data as fallback
    return [
      {
        id: "PAY-001",
        date: "2023-05-01",
        amount: 235.4,
        method: "Carte bancaire",
        status: "réussi",
      },
      {
        id: "PAY-002",
        date: "2023-05-02",
        amount: 125.0,
        method: "PayPal",
        status: "réussi",
      },
      {
        id: "PAY-003",
        date: "2023-05-03",
        amount: 450.75,
        method: "Virement bancaire",
        status: "en attente",
      },
      {
        id: "PAY-004",
        date: "2023-05-04",
        amount: 75.2,
        method: "Carte bancaire",
        status: "réussi",
      },
      {
        id: "PAY-005",
        date: "2023-05-05",
        amount: 225.0,
        method: "Carte bancaire",
        status: "échoué",
      },
    ];
  }
};