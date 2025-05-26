import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ProductProfit } from "@/types";

const ProductProfitTable = () => {
  const [profits, setProfits] = useState<ProductProfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfits();
    const interval = setInterval(fetchProfits, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const fetchProfits = async () => {
    try {
      const response = await axios.get("http://localhost/Backend_Mem/profits.php");
      setProfits(response.data);
    } catch (error) {
      console.error("Error fetching profits:", error);
      toast.error("Failed to fetch profit data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await axios.delete(`http://localhost/Backend_Mem/products.php?id=${productId}`);
      setProfits(prev => prev.filter(p => p.productId !== productId));
      toast.success("Product removed successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <div>Loading profit data...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Prix d'achat</TableHead>
            <TableHead>Prix de vente</TableHead>
            <TableHead>Quantité vendue</TableHead>
            <TableHead>Bénéfice unitaire</TableHead>
            <TableHead>Bénéfice total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profits.length > 0 ? (
            profits
              .sort((a, b) => b.totalProfit - a.totalProfit) // Tri par bénéfice décroissant
              .map((profit) => (
                <TableRow key={profit.productId}>
                  <TableCell className="font-medium">{profit.productName}</TableCell>
                  <TableCell>{formatCurrency(profit.purchasePrice)}</TableCell>
                  <TableCell>{formatCurrency(profit.sellingPrice)}</TableCell>
                  <TableCell>{profit.quantitySold}</TableCell>
                  <TableCell>{formatCurrency(profit.sellingPrice - profit.purchasePrice)}</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(profit.totalProfit)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(profit.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                Aucun bénéfice enregistré pour le moment
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductProfitTable;