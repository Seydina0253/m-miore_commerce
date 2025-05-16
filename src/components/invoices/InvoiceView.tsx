
import React, { useState } from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Printer } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Order;
  onClose: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, onClose }) => {
  const [status, setStatus] = useState<"pending" | "paid" | "cancelled">(invoice.status);
  const [isPrinted, setIsPrinted] = useState<boolean>(invoice.printed || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePrint = async () => {
    try {
      // Mark as printed if not already
      if (!isPrinted) {
        await axios.put("http://localhost/Backend_Mem/invoices.php", {
          id: invoice.id,
          printed: true
        });
        setIsPrinted(true);
        toast.success("Invoice marked as printed");
      }
      
      window.print();
    } catch (error) {
      console.error("Error updating print status:", error);
      toast.error("Failed to update print status");
      // Still allow printing even if status update fails
      window.print();
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Mark as printed if not already
      if (!isPrinted) {
        await axios.put("http://localhost/Backend_Mem/invoices.php", {
          id: invoice.id,
          printed: true
        });
        setIsPrinted(true);
        toast.success("Invoice marked as printed");
      }
      
      // Open the PDF in a new tab
      window.open(`http://localhost/Backend_Mem/invoices.php?id=${invoice.id}&pdf=true`, '_blank');
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleUpdateStatus = async () => {
    if (status === invoice.status) return;

    try {
      setIsUpdating(true);
      await axios.put("http://localhost/Backend_Mem/invoices.php", {
        id: invoice.id,
        status
      });
      toast.success("Invoice status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      setStatus(invoice.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="print:shadow-none print:border-none w-full">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Invoice #{invoice.invoiceNumber}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Date: {formatDate(invoice.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-md text-sm font-medium 
              ${status === 'paid' ? 'bg-green-100 text-green-800' : 
                status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
              {status === 'paid' ? 'Paid' : 
               status === 'pending' ? 'Pending' : 'Cancelled'}
            </span>
            
            <span className={`px-3 py-1 rounded-md text-sm font-medium 
              ${isPrinted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {isPrinted ? 'Printed' : 'Not Printed'}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-medium">Customer Information</h3>
          <p className="text-sm text-muted-foreground">Walk-in Customer</p>
        </div>

        <div>
          <h3 className="font-medium mb-3">Order Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{item.discount}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="font-medium">Total Amount</div>
          <div className="text-xl font-bold">
            {formatCurrency(invoice.total)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm">Status:</span>  
          <Select
            value={status}
            onValueChange={(value: "pending" | "paid" | "cancelled") => setStatus(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleUpdateStatus} 
            disabled={status === invoice.status || isUpdating}
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={onClose}>Back</Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={handleGeneratePDF}
          >
            <FileText className="h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InvoiceView;