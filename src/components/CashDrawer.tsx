import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { toast } from 'sonner';

interface CashDrawerData {
  totalCash: number;
  paymentsIn: number;
  vouchersOut: number;
  vouchersIn: number;
  period: "day" | "week" | "month" | "year";
  selectedDate?: Date;
  previousDayCash?: number;
}

interface DailyTransaction {
  date: string;
  cashIn: number;
  cashOut: number;
  dailyCash: number;
  voucherDetails?: VoucherDetail[];
}

interface VoucherDetail {
  id: string;
  voucherNumber: string;
  type: string;
  amount: number;
  description: string;
}

interface CashDrawerProps {
  className?: string;
}

const CashDrawer: React.FC<CashDrawerProps> = ({ className }) => {
  const [cashData, setCashData] = useState<CashDrawerData>({
    totalCash: 0,
    paymentsIn: 0,
    vouchersOut: 0,
    vouchersIn: 0,
    period: "day"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchCashDrawerData(cashData.period, date);
    
    const interval = setInterval(() => {
      fetchCashDrawerData(cashData.period, date);
    }, 2000);

    return () => clearInterval(interval);
  }, [cashData.period, date]);

  const fetchCashDrawerData = async (period: "day" | "week" | "month" | "year", selectedDate?: Date) => {
    setIsLoading(true);
    try {
      const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
      
      const paymentsResponse = await axios.get("http://localhost/Backend_Mem/payments.php", {
        params: { 
          cashDrawer: true, 
          period, 
          date: dateParam,
          dailyMode: true
        }
      });

      const vouchersResponse = await axios.get("http://localhost/Backend_Mem/vouchers.php", {
        params: { summary: true, period, date: dateParam }
      });

      if (selectedDate) {
        const detailsResponse = await axios.get("http://localhost/Backend_Mem/vouchers.php", {
          params: { dailyDetails: true, date: dateParam }
        });
        
        if (detailsResponse.data.success) {
          setDailyTransactions(detailsResponse.data);
        }
      }

      const responseData = paymentsResponse.data;
      const voucherData = vouchersResponse.data.summary || {};
      
      setCashData({
        totalCash: responseData.dailyCash || 0,
        paymentsIn: responseData.cashIn || 0,
        vouchersOut: (voucherData.expenseAmount || 0) + (voucherData.outputAmount || 0),
        vouchersIn: voucherData.entryAmount || 0,
        period,
        selectedDate,
        previousDayCash: responseData.previousDayCash || 0
      });

    } catch (error) {
      console.error("Erreur lors du chargement des données de caisse:", error);
      toast.error("Impossible de charger les données de caisse");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    const newPeriodType = newPeriod as "day" | "week" | "month" | "year";
    setCashData({
      ...cashData,
      period: newPeriodType
    });
    
    if (newPeriodType !== "day") {
      setDate(new Date());
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      fetchCashDrawerData("day", newDate);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    if (cashData.selectedDate && cashData.period === "day") {
      return format(cashData.selectedDate, "d MMMM yyyy", { locale: fr });
    }
    
    switch (cashData.period) {
      case "day": return "aujourd'hui";
      case "week": return "cette semaine";
      case "month": return "ce mois";
      case "year": return "cette année";
      default: return "aujourd'hui";
    }
  };

  const getDailyBalance = () => {
    return cashData.paymentsIn + cashData.vouchersIn - cashData.vouchersOut;
  };

  const getVoucherTypeText = (type: string) => {
    switch (type) {
      case 'expense': return 'Dépense';
      case 'output': return 'Sortie';
      case 'entry': return 'Entrée';
      default: return type;
    }
  };

  const getVoucherTypeColor = (type: string) => {
    switch (type) {
      case 'expense': return 'text-red-600';
      case 'output': return 'text-blue-600';
      case 'entry': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Caisse Journalière</CardTitle>
      </CardHeader>
      <div style={{ margin: '17px' }}>
        <div className="ml-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
          
      <CardContent className="space-y-2">
        

        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-700 font-medium">
            {cashData.period === "day" ? "Solde Journalier" : `Solde ${getPeriodLabel()}`}
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {isLoading ? "Chargement..." : formatCurrency(cashData.totalCash)}
          </p>
          {cashData.period === "day" && (
            <p className="text-xs text-blue-600 mt-1">
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-green-700 font-medium">Factures {getPeriodLabel()}</p>
            <p className="text-lg font-bold text-green-900">
              {isLoading ? "..." : formatCurrency(cashData.paymentsIn)}
            </p>
          </div>
          
          <div className="bg-emerald-50 p-3 rounded-md">
            <p className="text-xs text-emerald-700 font-medium">Bons d'Entrée {getPeriodLabel()}</p>
            <p className="text-lg font-bold text-emerald-900">
              {isLoading ? "..." : formatCurrency(cashData.vouchersIn)}
            </p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-xs text-red-700 font-medium">Bons de Sortie {getPeriodLabel()}</p>
            <p className="text-lg font-bold text-red-900">
              {isLoading ? "..." : formatCurrency(cashData.vouchersOut)}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">Résumé</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="pt-4">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Total des factures encaissées:</span>
                <span>{formatCurrency(cashData.paymentsIn)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total des bons d'entrée traités:</span>
                <span className="text-green-600">{formatCurrency(cashData.vouchersIn)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total des bons de sortie traités:</span>
                <span className="text-red-600">{formatCurrency(cashData.vouchersOut)}</span>
              </li>
              <li className="flex justify-between font-semibold pt-2 border-t">
                <span>Balance {cashData.period === "day" ? "journalière" : "de la période"}:</span>
                <span className={getDailyBalance() >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(getDailyBalance())}
                </span>
              </li>
              {cashData.period === "day" && cashData.previousDayCash !== undefined && (
                <li className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>Solde jour précédent:</span>
                  <span>{formatCurrency(cashData.previousDayCash)}</span>
                </li>
              )}
            </ul>
          </TabsContent>
          
          <TabsContent value="details" className="pt-4">
            {isLoading ? (
              <div className="text-center py-4">Chargement des détails...</div>
            ) : dailyTransactions?.voucherDetails && dailyTransactions.voucherDetails.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Bons traités {getPeriodLabel()}</h3>
                <div className="max-h-[250px] overflow-y-auto">
                  {dailyTransactions.voucherDetails.map((voucher) => (
                    <div key={voucher.id} className="border-b py-2">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-sm font-medium">{voucher.voucherNumber}</span>
                          <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-100">
                            {getVoucherTypeText(voucher.type)}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${getVoucherTypeColor(voucher.type)}`}>
                          {voucher.type === 'entry' ? '+' : '-'}{formatCurrency(voucher.amount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{voucher.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-center text-gray-500">
                Aucun bon traité pour la période sélectionnée.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CashDrawer;