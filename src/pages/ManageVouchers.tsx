
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import VoucherForm from "@/components/vouchers/VoucherForm";
import { Voucher } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ManageVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchVouchers();
  }, []);
  
  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost/Backend_Mem/vouchers.php");
      setVouchers(response.data.vouchers || []);
    } catch (error) {
      console.error("Erreur lors du chargement des bons:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du chargement des bons"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateVoucher = async (data: Omit<Voucher, "id" | "voucher_number" | "date" | "status" | "printed"> & { voucher_number: string }) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost/Backend_Mem/vouchers.php", {
        ...data,
        voucher_number: data.voucher_number,
      });
      
      if (response.data.success) {
        setVouchers([response.data.voucher, ...vouchers]);
        toast({
          title: "Succès",
          description: "Bon créé avec succès"
        });
      } else {
        throw new Error(response.data.error || "Erreur lors de la création du bon");
      }
    } catch (error) {
      console.error("Erreur lors de la création du bon:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la création du bon"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openPrintDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setPrintDialogOpen(true);
  };
  
  const handlePrintVoucher = async () => {
    if (!selectedVoucher) return;
    
    try {
      if (!selectedVoucher.printed) {
        await axios.put("http://localhost/Backend_Mem/vouchers.php", {
          voucher_number: selectedVoucher.voucher_number,
          printed: true
        });
        
        setVouchers(vouchers.map(v => 
          v.voucher_number === selectedVoucher.voucher_number ? { ...v, printed: true } : v
        ));
      }
      
      window.open(`http://localhost/Backend_Mem/vouchers.php?voucher_number=${selectedVoucher.voucher_number}&pdf=true`, '_blank');
      
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'impression du bon"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-100 text-green-800">Traité</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getVoucherTypeText = (type: string) => {
    switch (type) {
      case "expense":
        return "Dépense";
      case "output":
        return "Sortie";
      case "entry":
        return "Entrée";
      default:
        return type;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const expenseVouchers = vouchers.filter(v => v.type === "expense");
  const outputVouchers = vouchers.filter(v => v.type === "output");
  const entryVouchers = vouchers.filter(v => v.type === "entry");

  return (
    <MainLayout requiredRole="gestionnaire_bon">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-vente-dark">Gestion des Bons</h1>
          <p className="text-vente-gray mt-1">Créez et gérez les bons de dépense, de sortie et d'entrée</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Créer un Bon</h2>
              <VoucherForm onSubmit={handleCreateVoucher} isLoading={isSubmitting} />
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tous les Bons</TabsTrigger>
                <TabsTrigger value="expense">Bons de Dépense</TabsTrigger>
                <TabsTrigger value="output">Bons de Sortie</TabsTrigger>
                <TabsTrigger value="entry">Bons d'Entrée</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead> 
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Chargement des bons...
                          </TableCell>
                        </TableRow>
                      ) : vouchers.length > 0 ? (
                        vouchers.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                            <TableCell className="capitalize">
                              {getVoucherTypeText(voucher.type)}
                            </TableCell>
                            <TableCell>{formatCurrency(voucher.amount)}</TableCell>
                            <TableCell>{formatDate(voucher.date)}</TableCell>
                            <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant={voucher.printed ? "outline" : "default"}
                                className="flex items-center gap-2"
                                onClick={() => openPrintDialog(voucher)}
                              >
                                <Printer className="h-4 w-4" />
                                {voucher.printed ? "Réimprimer" : "Imprimer"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            Aucun bon trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="expense" className="mt-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Chargement des bons...
                          </TableCell>
                        </TableRow>
                      ) : expenseVouchers.length > 0 ? (
                        expenseVouchers.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                            <TableCell>{formatCurrency(voucher.amount)}</TableCell>
                            <TableCell>{voucher.description}</TableCell>
                            <TableCell>{formatDate(voucher.date)}</TableCell>
                            <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant={voucher.printed ? "outline" : "default"}
                                className="flex items-center gap-2"
                                onClick={() => openPrintDialog(voucher)}
                              >
                                <Printer className="h-4 w-4" />
                                {voucher.printed ? "Réimprimer" : "Imprimer"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            Aucun bon de dépense trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="mt-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Chargement des bons...
                          </TableCell>
                        </TableRow>
                      ) : outputVouchers.length > 0 ? (
                        outputVouchers.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                            <TableCell>{formatCurrency(voucher.amount)}</TableCell>
                            <TableCell>{voucher.description}</TableCell>
                            <TableCell>{formatDate(voucher.date)}</TableCell>
                            <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant={voucher.printed ? "outline" : "default"}
                                className="flex items-center gap-2"
                                onClick={() => openPrintDialog(voucher)}
                              >
                                <Printer className="h-4 w-4" />
                                {voucher.printed ? "Réimprimer" : "Imprimer"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            Aucun bon de sortie trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="entry" className="mt-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Chargement des bons...
                          </TableCell>
                        </TableRow>
                      ) : entryVouchers.length > 0 ? (
                        entryVouchers.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                            <TableCell>{formatCurrency(voucher.amount)}</TableCell>
                            <TableCell>{voucher.description}</TableCell>
                            <TableCell>{formatDate(voucher.date)}</TableCell>
                            <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant={voucher.printed ? "outline" : "default"}
                                className="flex items-center gap-2"
                                onClick={() => openPrintDialog(voucher)}
                              >
                                <Printer className="h-4 w-4" />
                                {voucher.printed ? "Réimprimer" : "Imprimer"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            Aucun bon d'entrée trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Impression du Bon</DialogTitle>
            <DialogDescription>
              Détails du bon à imprimer
            </DialogDescription>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-6 py-4">
              <div className={`p-4 rounded-md ${
                selectedVoucher.type === 'expense' ? 'bg-amber-50' : 
                selectedVoucher.type === 'entry' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{selectedVoucher.voucher_number}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedVoucher.type === 'expense' 
                      ? 'bg-amber-100 text-amber-800' 
                      : selectedVoucher.type === 'entry'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedVoucher.type === 'expense' ? 'Bon de Dépense' : 
                     selectedVoucher.type === 'entry' ? 'Bon d\'Entrée' : 'Bon de Sortie'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Date: {formatDate(selectedVoucher.date)}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">{selectedVoucher.description}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold">Montant</span>
                <span className="text-xl font-bold">{formatCurrency(selectedVoucher.amount)}</span>
              </div>
              
              <div className="pt-2">
                <span className="text-sm text-gray-500">Statut: {getStatusBadge(selectedVoucher.status)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              Fermer
            </Button>
            <Button 
              onClick={handlePrintVoucher}
              className="bg-vente-primary hover:bg-vente-accent flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              {selectedVoucher?.printed ? "Réimprimer" : "Imprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ManageVouchers;