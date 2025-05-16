
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProductsChart = () => {
  // Données de démonstration
  const data = [
    { name: "Produit A", sales: 400 },
    { name: "Produit B", sales: 300 },
    { name: "Produit C", sales: 290 },
    { name: "Produit D", sales: 200 },
    { name: "Produit E", sales: 180 },
  ];

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
          <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsChart;
