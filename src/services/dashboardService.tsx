
import axios from 'axios';

export interface DashboardStats {
  totalSales: number;
  productsCount: number;
  ordersCount: number;
  vouchersCount: number;
  dailyCash: number;
  lastResetDate: string;
  vouchersBreakdown: {
    expense: number;
    output: number;
    entry: number;
  };
  netCashFlow: number;
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
    const response = await axios.get('http://localhost/Backend_Mem/dashboard.php?stats=true&daily=true&include_vouchers=true');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new Error("Impossible de charger les statistiques du tableau de bord");
  }
};

export const fetchRecentTransactions = async (): Promise<RecentTransaction[]> => {
  try {
    const response = await axios.get('http://localhost/Backend_Mem/dashboard.php?transactions=true&daily=true');
    return response.data.transactions;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions récentes:', error);
    throw new Error("Impossible de charger les transactions récentes");
  }
};

export const resetDailyCash = async (): Promise<void> => {
  try {
    await axios.post('http://localhost/Backend_Mem/dashboard.php', { action: 'reset_daily_cash' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la caisse journalière:', error);
    throw new Error("Impossible de réinitialiser la caisse journalière");
  }
};