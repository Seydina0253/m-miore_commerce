
import axios from 'axios';

export interface DashboardStats {
  totalSales: number;
  productsCount: number;
  ordersCount: number;
  vouchersCount: number;
}

export interface RecentTransaction {
  id: string;
  reference: string;
  date: string;
  amount: number;
  status: string;
  type: 'order' | 'voucher';
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await axios.get('http://localhost/Backend_Mem/dashboard.php?stats=true');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new Error("Impossible de charger les statistiques du tableau de bord");
  }
};

export const fetchRecentTransactions = async (): Promise<RecentTransaction[]> => {
  try {
    const response = await axios.get('http://localhost/Backend_Mem/dashboard.php?transactions=true');
    return response.data.transactions;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions récentes:', error);
    throw new Error("Impossible de charger les transactions récentes");
  }
};