
import React from "react";
import { RecentTransaction } from "@/services/dashboardService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "processed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Payé</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">En attente</Badge>;
      case "cancelled":
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionType = (type: string) => {
    return type === 'order' ? 'Facture' : 'Bon';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.reference}</TableCell>
                <TableCell>{getTransactionType(transaction.type)}</TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Aucune transaction trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentTransactionsTable;