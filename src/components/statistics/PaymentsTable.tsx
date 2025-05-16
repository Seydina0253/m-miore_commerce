
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PaymentsTable = () => {
  // Données de démonstration
  const payments = [
    {
      id: "PAY-001",
      date: "2023-05-01",
      amount: 235.4,
      method: "Carte bancaire",
      status: "réussi",
    },
    {
      id: "PAY-002",
      date: "2023-05-02",
      amount: 125.0,
      method: "PayPal",
      status: "réussi",
    },
    {
      id: "PAY-003",
      date: "2023-05-03",
      amount: 450.75,
      method: "Virement bancaire",
      status: "en attente",
    },
    {
      id: "PAY-004",
      date: "2023-05-04",
      amount: 75.2,
      method: "Carte bancaire",
      status: "réussi",
    },
    {
      id: "PAY-005",
      date: "2023-05-05",
      amount: 225.0,
      method: "Carte bancaire",
      status: "échoué",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "réussi":
        return <Badge className="bg-green-500">Réussi</Badge>;
      case "en attente":
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case "échoué":
        return <Badge className="bg-red-500">Échoué</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Méthode</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">{payment.id}</TableCell>
            <TableCell>{formatDate(payment.date)}</TableCell>
            <TableCell>{payment.amount.toFixed(2)} €</TableCell>
            <TableCell>{payment.method}</TableCell>
            <TableCell>{getStatusBadge(payment.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PaymentsTable;
