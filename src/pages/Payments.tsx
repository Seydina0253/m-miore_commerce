import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Order, ProductProfit } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import CashDrawer from "@/components/CashDrawer";
import ProductProfitTable from "@/components/ProductProfitTable";

const formSchema = z.object({
  invoiceNumber: z.string().min(1, "Le numéro de facture est requis"),
});

type PaymentFormValues = z.infer<typeof formSchema>;

const Payments: React.FC = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profits, setProfits] = useState<ProductProfit[]>([]);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: "",
    },
  });

  useEffect(() => {
    const fetchProfits = async () => {
      try {
        const response = await axios.get("http://localhost/Backend_Mem/profits.php");
        setProfits(response.data);
      } catch (error) {
        console.error("Error fetching profits:", error);
        toast.error("Failed to fetch profit data");
      }
    };

    fetchProfits();
    const interval = setInterval(fetchProfits, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      const response = await axios.get(`http://localhost/Backend_Mem/payments.php?invoiceNumber=${values.invoiceNumber}`);
      const order = response.data;
      
      if (order.error) {
        toast.error("Facture introuvable");
        return;
      }
      
      if (order.status === "paid") {
        toast.error("Facture déjà payée");
        return;
      }
      
      setCurrentOrder(order);
      form.reset();
    } catch (error) {
      console.error("Erreur lors de la recherche de la facture:", error);
      toast.error("Erreur lors de la recherche de la facture");
    }
  };
  
  const handleProcessPayment = async () => {
    if (!currentOrder) return;
    
    setIsProcessing(true);
    
    try {
      const response = await axios.post("http://localhost/Backend_Mem/payments.php", {
        orderId: currentOrder.id,
        amount: currentOrder.total,
        paymentMethod: "cash"
      });
      
      if (response.data.success) {
        toast.success("Paiement traité avec succès");
        setCurrentOrder(null);
      } else {
        throw new Error(response.data.error || "Erreur lors du traitement du paiement");
      }
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      toast.error("Erreur lors du traitement du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await axios.delete(`http://localhost/Backend_Mem/products.php?id=${productId}`);
      setProfits(prev => prev.filter(p => p.productId !== productId));
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Échec de la suppression du produit");
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <MainLayout requiredRole="caissier">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Paiements</h1>
          <p className="text-muted-foreground mt-1">Traiter les paiements des clients</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> {/* Changement de 3 à 4 colonnes */}
            <CashDrawer className="col-span-1 md:col-span-2" /> {/* Caisse agrandie (3 colonnes au lieu de 1) */}
            
            <Card className="col-span-2"> {/* Formulaire réduit à 1 colonne */}
              <CardHeader>
                <CardTitle>Traiter un Paiement</CardTitle>
                <CardDescription>Entrez un numéro de facture pour traiter le paiement</CardDescription>
              </CardHeader>
              <CardContent>
                {currentOrder ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Facture {currentOrder.invoiceNumber}</h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          En attente de paiement
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Date: {formatDate(currentOrder.date)}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Articles</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {currentOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm py-1 border-b border-gray-100">
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                            <span>{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-semibold">Montant Total</span>
                      <span className="text-xl font-bold">{formatCurrency(currentOrder.total)}</span>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handleProcessPayment} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Traitement..." : "Traiter le Paiement"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de Facture</FormLabel>
                            <FormControl>
                              <Input placeholder="ex: 0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="bg-vente-primary hover:bg-vente-accent w-full">
                        Rechercher la Facture
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
              {!currentOrder && (
                <CardFooter className="text-sm text-gray-500">
                  Entrez le numéro de facture exact (ex: 0000)
                </CardFooter>
              )}
            </Card>
          </div>

          
        </div>
      </div>
    </MainLayout>
  );
};

export default Payments;