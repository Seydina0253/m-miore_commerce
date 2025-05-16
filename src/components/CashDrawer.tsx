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
  period: "day" | "week" | "month" | "year";
  selectedDate?: Date;
}

interface DailyTransaction {
  date: string;
  cashIn: number;
  cashOut: number;
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
    period: "day"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchCashDrawerData(cashData.period, date);
  }, [cashData.period, date]);

  const fetchCashDrawerData = async (period: "day" | "week" | "month" | "year", selectedDate?: Date) => {
    setIsLoading(true);
    try {
      const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
      
      // Get payments summary
      const paymentsResponse = await axios.get("http://localhost/Backend_Mem/payments.php", {
        params: { cashDrawer: true, period, date: dateParam }
      });

      // Get vouchers summary
      const vouchersResponse = await axios.get("http://localhost/Backend_Mem/vouchers.php", {
        params: { summary: true, period, date: dateParam }
      });

      // Get detailed transactions for selected date if in details view
      if (selectedDate) {
        const detailsResponse = await axios.get("http://localhost/Backend_Mem/vouchers.php", {
          params: { dailyDetails: true, date: dateParam }
        });
        
        if (detailsResponse.data.success) {
          setDailyTransactions(detailsResponse.data);
        }
      }

      setCashData({
        totalCash: vouchersResponse.data.cashDrawer.totalCash,
        paymentsIn: paymentsResponse.data.cashIn || 0, // Corrected value directly from API
        vouchersOut: vouchersResponse.data.summary.processedAmount || 0,
        period,
        selectedDate
      });

    } catch (error) {
      console.error("Erreur lors du chargement des données de caisse:", error);
      toast.error("Impossible de charger les données de caisse");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setCashData({
      ...cashData,
      period: newPeriod as "day" | "week" | "month" | "year"
    });
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Caisse</CardTitle>
        <CardDescription>Solde actuel et transactions</CardDescription>
      </CardHeader>
      <div style={{ margin: '17px' }}>
      <div className="ml-1" >
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
          
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Tabs defaultValue="day" value={cashData.period} onValueChange={handlePeriodChange} className="flex-1">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="day">Jour</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
              <TabsTrigger value="month">Mois</TabsTrigger>
              <TabsTrigger value="year">Année</TabsTrigger>
            </TabsList>
          </Tabs>
          
          
        </div>
        

        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-700 font-medium">Solde Actuel</p>
          <p className="text-2xl font-bold text-blue-900">
            {isLoading ? "Chargement..." : formatCurrency(cashData.totalCash)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-green-700 font-medium">Entrées {getPeriodLabel()}</p>
            <p className="text-lg font-bold text-green-900">
              {isLoading ? "..." : formatCurrency(cashData.paymentsIn)}
            </p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-xs text-red-700 font-medium">Sorties {getPeriodLabel()}</p>
            <p className="text-lg font-bold text-red-900">
              {isLoading ? "..." : formatCurrency(cashData.vouchersOut)}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">Résumé</TabsTrigger>
            
          </TabsList>
          
          <TabsContent value="summary" className="pt-4">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Total des factures encaissées:</span>
                <span>{formatCurrency(cashData.paymentsIn)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total des bons traités:</span>
                <span>{formatCurrency(cashData.vouchersOut)}</span>
              </li>
              <li className="flex justify-between font-semibold pt-2 border-t">
                <span>Balance:</span>
                <span>{formatCurrency(cashData.paymentsIn - cashData.vouchersOut)}</span>
              </li>
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
                            {voucher.type === 'expense' ? 'Dépense' : 'Sortie'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-red-600">{formatCurrency(voucher.amount)}</span>
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
          
          <TabsContent value="calendar" className="pt-4">
            <div className="text-center mb-3">
              <p className="text-sm font-medium">Sélectionnez une date dans le calendrier pour voir les détails</p>
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="p-3 pointer-events-auto border rounded-md"
              />
            </div>
            
            {cashData.selectedDate && (
              <div className="mt-4 space-y-2 border-t pt-2">
                <h3 className="font-medium text-sm mb-2">
                  Transactions du {format(cashData.selectedDate, 'd MMMM yyyy', { locale: fr })}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-xs text-green-700">Entrées</p>
                    <p className="text-sm font-bold">{formatCurrency(dailyTransactions?.cashIn || 0)}</p>
                  </div>
                  
                  <div className="p-2 bg-red-50 rounded">
                    <p className="text-xs text-red-700">Sorties</p>
                    <p className="text-sm font-bold">{formatCurrency(dailyTransactions?.cashOut || 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CashDrawer;