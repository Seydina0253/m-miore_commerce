
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import { ShoppingCart, Package, Receipt, DollarSign } from "lucide-react";
import { fetchDashboardStats, fetchRecentTransactions, DashboardStats, RecentTransaction } from "@/services/dashboardService";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const statsData = await fetchDashboardStats();
        const transactionsData = await fetchRecentTransactions();
        
        setStats(statsData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Erreur de chargement des données du tableau de bord:", error);
        toast.error("Impossible de charger les données du tableau de bord");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue, {user?.name || 'Utilisateur'}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Ventes Totales"
            value={stats ? formatCurrency(stats.totalSales) : "0"}
            icon={<span className="h-5 w-5">XAF</span>}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Produits"
            value={stats ? stats.productsCount : "0"}
            icon={<Package className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Commandes"
            value={stats ? stats.ordersCount : "0"}
            icon={<ShoppingCart className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Bons"
            value={stats ? stats.vouchersCount : "0"}
            icon={<Receipt className="h-5 w-5" />}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-8">
          <RecentTransactionsTable transactions={transactions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;