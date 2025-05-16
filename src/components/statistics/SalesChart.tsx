
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SalesChart = () => {
  // Données de démonstration
  const data = [
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

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} €`} />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#6366F1"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
