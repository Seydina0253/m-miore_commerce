import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CreditCard, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import axios from "axios";

interface PaymentData {
  invoiceNumber: string;
  amount: number;
}

interface VoucherData {
  voucherNumber: string;
  amount: number;
}

interface BilanData {
  payments: PaymentData[];
  entryVouchers: VoucherData[];
  outputVouchers: VoucherData[];
  expenseVouchers: VoucherData[];
  paymentsTotal: number;
  entryTotal: number;
  outputTotal: number;
  expenseTotal: number;
  cashBalance: number;
}

const Balance: React.FC = () => {
  const [bilanData, setBilanData] = useState<BilanData>({
    payments: [],
    entryVouchers: [],
    outputVouchers: [],
    expenseVouchers: [],
    paymentsTotal: 0,
    entryTotal: 0,
    outputTotal: 0,
    expenseTotal: 0,
    cashBalance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBilanData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const paymentsResponse = await axios.get(`http://localhost/Backend_Mem/payments.php?daily=true&date=${today}`);
      const vouchersResponse = await axios.get(`http://localhost/Backend_Mem/vouchers.php?dailyDetails=true&date=${today}`);
      const cashResponse = await axios.get(`http://localhost/Backend_Mem/payments.php?cashDrawer=true&period=day&date=${today}&dailyMode=true`);
      
      const payments = paymentsResponse.data.payments || [];
      const vouchers = vouchersResponse.data.voucherDetails || [];
      
      const entryVouchers = vouchers.filter((v: any) => v.type === 'entry');
      const outputVouchers = vouchers.filter((v: any) => v.type === 'output');
      const expenseVouchers = vouchers.filter((v: any) => v.type === 'expense');
      
      const paymentsTotal = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const entryTotal = entryVouchers.reduce((sum: number, v: any) => sum + v.amount, 0);
      const outputTotal = outputVouchers.reduce((sum: number, v: any) => sum + v.amount, 0);
      const expenseTotal = expenseVouchers.reduce((sum: number, v: any) => sum + v.amount, 0);
      
      const dailyCashBalance = cashResponse.data.dailyCash || 0;
      
      setBilanData({
        payments: payments.map((p: any) => ({
          invoiceNumber: p.invoiceNumber,
          amount: p.amount
        })),
        entryVouchers: entryVouchers.map((v: any) => ({
          voucherNumber: v.voucherNumber,
          amount: v.amount
        })),
        outputVouchers: outputVouchers.map((v: any) => ({
          voucherNumber: v.voucherNumber,
          amount: v.amount
        })),
        expenseVouchers: expenseVouchers.map((v: any) => ({
          voucherNumber: v.voucherNumber,
          amount: v.amount
        })),
        paymentsTotal,
        entryTotal,
        outputTotal,
        expenseTotal,
        cashBalance: dailyCashBalance
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données du bilan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBilanData();
    const interval = setInterval(fetchBilanData, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement du bilan...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Bilan Journalier</h1>
          <p className="text-gray-600 mt-1">
            Solde de caisse et transactions du {getCurrentDate()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte Factures - En haut à gauche */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CreditCard className="h-5 w-5" />
                Factures Payées Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-[70px] overflow-y-auto">
                {bilanData.payments.length > 0 ? (
                  bilanData.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-blue-200 last:border-b-0">
                      <span className="text-sm font-medium text-blue-700">
                        {payment.invoiceNumber}
                      </span>
                      <span className="text-sm text-blue-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-blue-600 text-sm text-center py-4">Aucune facture payée aujourd'hui</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-800">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    +{formatCurrency(bilanData.paymentsTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Bons d'Entrée - En haut à droite */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Bons d'Entrée Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-[70px] overflow-y-auto">
                {bilanData.entryVouchers.length > 0 ? (
                  bilanData.entryVouchers.map((voucher, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-green-200 last:border-b-0">
                      <span className="text-sm font-medium text-green-700">
                        {voucher.voucherNumber}
                      </span>
                      <span className="text-sm text-green-600">
                        {formatCurrency(voucher.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-green-600 text-sm text-center py-4">Aucun bon d'entrée traité aujourd'hui</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-800">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    +{formatCurrency(bilanData.entryTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Solde Caisse - Au milieu */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800 justify-center">
                <Wallet className="h-6 w-6" />
                Solde Journalier de la Caisse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-800 mb-2">
                  {formatCurrency(bilanData.cashBalance)}
                </div>
               
              </div>
            </CardContent>
          </Card>

          {/* Carte Bons de Sortie - En bas à gauche */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingDown className="h-5 w-5" />
                Bons de Sortie Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-[70px] overflow-y-auto">
                {bilanData.outputVouchers.length > 0 ? (
                  bilanData.outputVouchers.map((voucher, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-orange-200 last:border-b-0">
                      <span className="text-sm font-medium text-orange-700">
                        {voucher.voucherNumber}
                      </span>
                      <span className="text-sm text-orange-600">
                        {formatCurrency(voucher.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-orange-600 text-sm text-center py-4">Aucun bon de sortie traité aujourd'hui</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange-800">Total:</span>
                  <span className="text-lg font-bold text-red-600">
                    -{formatCurrency(bilanData.outputTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Bons de Dépense - En bas à droite */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Receipt className="h-5 w-5" />
                Bons de Dépense Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-[70px] overflow-y-auto">
                {bilanData.expenseVouchers.length > 0 ? (
                  bilanData.expenseVouchers.map((voucher, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-red-200 last:border-b-0">
                      <span className="text-sm font-medium text-red-700">
                        {voucher.voucherNumber}
                      </span>
                      <span className="text-sm text-red-600">
                        {formatCurrency(voucher.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-red-600 text-sm text-center py-4">Aucun bon de dépense traité aujourd'hui</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-red-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-red-800">Total:</span>
                  <span className="text-lg font-bold text-red-600">
                    -{formatCurrency(bilanData.expenseTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Balance;