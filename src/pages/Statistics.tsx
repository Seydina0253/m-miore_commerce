
import React, { useState, useEffect } from "react";
import { ChartBarIcon, TrendingUpIcon, CreditCardIcon, PackageIcon } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/statistics/SalesChart";
import ProductsChart from "@/components/statistics/ProductsChart";
import PaymentsTable from "@/components/statistics/PaymentsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStatisticsData, StatisticsData } from "@/services/statisticsService";

const Statistics = () => {
  const [stats, setStats] = useState<StatisticsData>({
    totalSales: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const statsData = await fetchStatisticsData();
        setStats(statsData);
      } catch (error) {
        console.error("Erreur de chargement des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <MainLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statistiques</h1>
          <p className="text-muted-foreground">
            Aperçu des performances commerciales et financières
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ventes totales"
            value={isLoading ? "Chargement..." : formatCurrency(stats.totalSales)}
            icon={<TrendingUpIcon className="text-blue-600" />}
            trend={{ value: 12, isPositive: true }}
            isLoading={isLoading}
          />
          <StatsCard
            title="Valeur moyenne des commandes"
            value={isLoading ? "Chargement..." : formatCurrency(stats.averageOrderValue)}
            icon={<CreditCardIcon className="text-blue-600" />}
            trend={{ value: 8, isPositive: true }}
            isLoading={isLoading}
          />
          <StatsCard
            title="Produits actifs"
            value={isLoading ? "Chargement..." : stats.totalProducts.toString()}
            icon={<PackageIcon className="text-blue-600" />}
            trend={{ value: 4, isPositive: true }}
            isLoading={isLoading}
          />
          <StatsCard
            title="Taux de conversion"
            value={isLoading ? "Chargement..." : `${stats.conversionRate}%`}
            icon={<ChartBarIcon className="text-blue-600" />}
            trend={{ value: 2, isPositive: false }}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des ventes</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <SalesChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top des produits vendus</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ProductsChart />
            </CardContent>
          </Card>
        </div>

        
      </div>
    </MainLayout>
  );
};

export default Statistics;