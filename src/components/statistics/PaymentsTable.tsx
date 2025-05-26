
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchRecentPaymentsData } from "@/services/statisticsService";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentsTable = () => {
  const [payments, setPayments] = useState<Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    status: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const paymentsData = await fetchRecentPaymentsData();
        setPayments(paymentsData);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "réussi":
      case "paid":
        return <Badge className="bg-green-500">Réussi</Badge>;
      case "en attente":
      case "pending":
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case "échoué":
      case "failed":
      case "cancelled":
        return <Badge className="bg-red-500">Échoué</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    
  }

  
};

export default PaymentsTable;