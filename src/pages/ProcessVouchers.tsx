import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Voucher } from "@/types";
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
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import CashDrawer from "@/components/CashDrawer";

const formSchema = z.object({
  voucher_number: z.string().min(1, "Le numéro de bon est requis"),
});

type VoucherFormValues = z.infer<typeof formSchema>;

const ProcessVouchers: React.FC = () => {
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voucher_number: "",
    },
  });

  const onSubmit = async (values: VoucherFormValues) => {
    try {
      const response = await axios.get(`http://localhost/Backend_Mem/vouchers.php?voucher_number=${values.voucher_number}`);
      const voucher = response.data;
      
      if (voucher.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Bon non trouvé"
        });
        return;
      }
      
      if (voucher.status === "processed") {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Bon déjà traité"
        });
        return;
      }
      
      setCurrentVoucher(voucher);
      form.reset();
    } catch (error) {
      console.error("Erreur lors de la recherche du bon:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la recherche du bon"
      });
    }
  };
  
  const handleProcessVoucher = async () => {
    if (!currentVoucher) return;
    
    setIsProcessing(true);
    
    try {
      const response = await axios.put("http://localhost/Backend_Mem/vouchers.php", {
        voucher_number: currentVoucher.voucher_number,
        status: "processed"
      });
      
      if (response.data.success) {
        toast({
          title: "Succès",
          description: "Bon traité avec succès"
        });
        setCurrentVoucher(null);
      } else {
        throw new Error(response.data.error || "Erreur lors du traitement du bon");
      }
    } catch (error) {
      console.error("Erreur lors du traitement du bon:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du traitement du bon"
      });
      if (axios.isAxiosError(error)) {
        console.log("Détails de l'erreur:", error.response?.data);
      }
    } finally {
      setIsProcessing(false);
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
          <h1 className="text-2xl font-bold text-vente-dark">Traiter les Bons</h1>
          <p className="text-vente-gray mt-1">Traiter les bons de dépense et de sortie</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
          <CashDrawer className="col-span-1" />
          
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Traiter un Bon</CardTitle>
              <CardDescription>Entrez un numéro de bon pour le traiter</CardDescription>
            </CardHeader>
            <CardContent>
              {currentVoucher ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-md ${
                    currentVoucher.type === 'expense' ? 'bg-amber-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{currentVoucher.voucher_number}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        currentVoucher.type === 'expense' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentVoucher.type === 'expense' ? 'Dépense' : 'Sortie'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Date: {formatDate(currentVoucher.date)}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Détails</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm mb-2">{currentVoucher.description}</p>
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-semibold">Montant</span>
                        <span className="text-xl font-bold">{formatCurrency(currentVoucher.amount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleProcessVoucher} 
                      className="w-full bg-vente-success hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Traitement..." : "Traiter le Bon"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="voucher_number" // Change to voucher_number
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de Bon</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: DEP-20240514-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full bg-vente-primary hover:bg-vente-accent">
                      Rechercher le Bon
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            {!currentVoucher && (
              <CardFooter className="text-sm text-gray-500">
                Entrez le numéro de bon exact (ex: DEP-20240514-001)
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProcessVouchers;