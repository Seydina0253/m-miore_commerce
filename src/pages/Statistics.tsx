
import React from "react";
import { ChartBarIcon, TrendingUpIcon, CreditCardIcon, PackageIcon } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/statistics/SalesChart";
import ProductsChart from "@/components/statistics/ProductsChart";
import PaymentsTable from "@/components/statistics/PaymentsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Statistics = () => {
  // Données de démonstration
  const stats = {
    totalSales: "45,678 €",
    averageOrderValue: "124 €",
    totalProducts: 234,
    conversionRate: "8.5%"
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
            value={stats.totalSales}
            icon={<TrendingUpIcon className="text-vente-primary" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Valeur moyenne des commandes"
            value={stats.averageOrderValue}
            icon={<CreditCardIcon className="text-vente-primary" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Produits actifs"
            value={stats.totalProducts}
            icon={<PackageIcon className="text-vente-primary" />}
            trend={{ value: 4, isPositive: true }}
          />
          <StatsCard
            title="Taux de conversion"
            value={stats.conversionRate}
            icon={<ChartBarIcon className="text-vente-primary" />}
            trend={{ value: 2, isPositive: false }}
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

        <Card>
          <CardHeader>
            <CardTitle>Derniers paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentsTable />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Statistics;
