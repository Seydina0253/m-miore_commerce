import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import { ShoppingCart, Package, Receipt, DollarSign, Clock } from "lucide-react";
import { fetchDashboardStats, fetchRecentTransactions, DashboardStats, RecentTransaction } from "@/services/dashboardService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadDashboardData = async () => {
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

  useEffect(() => {
    // Chargement initial
    loadDashboardData();

    // Mise à jour en temps réel toutes les 30 secondes
    intervalRef.current = setInterval(() => {
      loadDashboardData();
      setCurrentTime(new Date());
    }, 30000);

    // Horloge temps réel
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(clockInterval);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isNewDay = () => {
    if (!stats?.lastResetDate) return false;
    const lastReset = new Date(stats.lastResetDate);
    const today = new Date();
    return lastReset.toDateString() !== today.toDateString();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-700">Tableau de Bord Journalier</h1>
            <p className="text-gray-600 mt-1">Bienvenue, {user?.name || 'Utilisateur'}!</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <Clock className="h-5 w-5" />
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-600">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {isNewDay() && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Une nouvelle journée a commencé. Les statistiques vont se réinitialiser automatiquement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCard
            title="Ventes du Jour"
            value={stats ? formatCurrency(stats.totalSales) : "0"}
            icon={<Receipt className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Produits Vendus"
            value={stats ? stats.productsCount.toString() : "0"}
            icon={<Package className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Commandes du Jour"
            value={stats ? stats.ordersCount.toString() : "0"}
            icon={<ShoppingCart className="h-5 w-5" />}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Bons du Jour"
            value={stats ? stats.vouchersCount.toString() : "0"}
            icon={<Receipt className="h-5 w-5" />}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Transactions du Jour</h2>
            
          </div>
          <RecentTransactionsTable transactions={transactions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;