import React from "react";
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
import { ProductProfit } from "@/types";

interface ProductProfitTableProps {
  profits: ProductProfit[];
  onDelete: (productId: string) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
};

const ProductProfitTable: React.FC<ProductProfitTableProps> = ({ 
  profits, 
  onDelete 
}) => {
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
            profits.map((profit) => (
              <TableRow key={profit.productId}>
                <TableCell className="font-medium">{profit.productName}</TableCell>
                <TableCell>{formatCurrency(profit.purchasePrice)}</TableCell>
                <TableCell>{formatCurrency(profit.sellingPrice)}</TableCell>
                <TableCell>{profit.quantitySold}</TableCell>
                <TableCell>
                  {formatCurrency(profit.sellingPrice - profit.purchasePrice)}
                </TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(profit.totalProfit)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(profit.productId)}
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

// Exportez comme export DEFAULT
export default ProductProfitTable;