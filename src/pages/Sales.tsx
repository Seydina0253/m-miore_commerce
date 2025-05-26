import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import SalesForm from '@/components/sales/SalesForm';
import { Order, OrderItem } from '@/types';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Printer } from 'lucide-react';

const Sales = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  
  const handleCreateOrder = async (items: OrderItem[], saveAsDraft: boolean = false) => {
    try {
      const response = await axios.post("http://localhost/Backend_Mem/orders.php", {
        items: items.map(item => ({
          productId: parseInt(item.productId), 
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total
        })),
        saveAsDraft 
      });

      const newOrder: Order = {
        id: response.data.order.id.toString(),
        items,
        total: response.data.order.total,
        date: response.data.order.date,
        invoiceNumber: response.data.order.invoiceNumber,
        status: response.data.order.status,
        printed: false
      };

      setCurrentOrder(newOrder);

      if (saveAsDraft) {
        toast.success("Sale saved as draft!");
        navigate('/invoices');
      } else {
        toast.success("Invoice generated successfully!");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create invoice");
    }
  };

  const handlePrintInvoice = async () => {
    if (!currentOrder) return;
    
    try {
      await axios.put(`http://localhost/Backend_Mem/invoices.php`, {
        id: currentOrder.id,
        printed: true
      });
      
      window.print();
      
      setCurrentOrder({
        ...currentOrder,
        printed: true
      });
      
      toast.success("Invoice marked as printed");
    } catch (error) {
      console.error("Error marking invoice as printed:", error);
      toast.error("Failed to update invoice status");
      window.print();
    }
  };

  const handleViewAllInvoices = () => {
    navigate('/invoices');
  };

  const handleNewSale = () => {
    setCurrentOrder(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout requiredRole="facturier">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ventes</h1>
            <p className="text-muted-foreground">Créer et gérer les commandes des clients</p>
          </div>
        </div>

        {currentOrder ? (
          <Card className="printable-invoice">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Facture #{currentOrder.invoiceNumber}</CardTitle>
                  <CardDescription>
                    {format(new Date(currentOrder.date), 'PPPPp', { locale: fr })}
                  </CardDescription>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-md text-sm">
                  {currentOrder.status.toUpperCase()}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Commandes produits</h3>
                <div className="space-y-3">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.discount > 0 && ` (${item.discount}% off)`}
                        </p>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="font-medium">Montant Total</div>
                <div className="text-xl font-bold">
                  {formatCurrency(currentOrder.total)}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between print:hidden">
              <Button variant="outline" onClick={handleNewSale}>
                Nouvelle Vente
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant={currentOrder.printed ? "outline" : "default"}
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  {currentOrder.printed ? "Print Again" : "Imprimer la facture"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <SalesForm onSubmit={handleCreateOrder} />
        )}
      </div>
    </MainLayout>
  );
};

export default Sales;