
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import InvoiceView from "@/components/invoices/InvoiceView";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails(id);
    }
  }, [id]);

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost/Backend_Mem/invoices.php", {
        params: { id: invoiceId }
      });
      setInvoice(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des détails de la facture:", error);
      toast.error("Échec du chargement des détails de la facture");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/invoices");
  };

  return (
    <MainLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleGoBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux factures</span>
          </Button>
          <h1 className="text-2xl font-bold text-vente-dark">Détail de la facture</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <p>Chargement des détails de la facture...</p>
          </div>
        ) : invoice ? (
          <InvoiceView invoice={invoice} onClose={handleGoBack} />
        ) : (
          <div className="flex justify-center items-center h-60">
            <p>Facture non trouvée</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InvoiceDetail;