
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchTopProductsData } from "@/services/statisticsService";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsChart = () => {
  const [data, setData] = useState<Array<{ name: string; sales: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const productsData = await fetchTopProductsData();
        setData(productsData);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} unités`} />
          <Legend />
          <Bar dataKey="sales" name="Ventes" fill="#6366F1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsChart;