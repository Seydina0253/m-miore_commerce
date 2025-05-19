import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Order, InvoiceSummary } from "@/types";
import InvoiceView from "@/components/invoices/InvoiceView";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Eye, ArrowUp, ArrowDown, Printer } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary>({
    totalPrinted: 0,
    totalAmount: 0,
    printedCount: 0,
    unprintedCount: 0
  });
  const [activeTab, setActiveTab] = useState<"all" | "printed" | "unprinted">("all");

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceSummary();
  }, [pagination.page, sortField, sortDirection, activeTab]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost/Backend_Mem/invoices.php", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          sort: sortField,
          direction: sortDirection,
          filter: activeTab !== "all" ? activeTab : undefined
        }
      });

      setInvoices(response.data.invoices);
      setPagination(response.data.pagination);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
      setIsLoading(false);
    }
  };

  const fetchInvoiceSummary = async () => {
    try {
      const response = await axios.get("http://localhost/Backend_Mem/invoices.php", {
        params: { summary: true }
      });
      setInvoiceSummary(response.data.summary);
    } catch (error) {
      console.error("Error loading invoice summary:", error);
    }
  };

  const fetchInvoiceDetails = async (id: string) => {
    try {
      const response = await axios.get("http://localhost/Backend_Mem/invoices.php", {
        params: { id }
      });
      setSelectedInvoice(response.data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error loading invoice details:", error);
      toast.error("Failed to load invoice details");
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    fetchInvoiceDetails(invoiceId);
  };

  const handleCloseInvoice = () => {
    setSelectedInvoice(null);
    setIsDialogOpen(false);
    // Refresh data after closing to reflect any status changes
    fetchInvoices();
    fetchInvoiceSummary();
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      await axios.put("http://localhost/Backend_Mem/invoices.php", {
        id: invoiceId,
        printed: true
      });
      
      // Open invoice in a new tab for printing
      window.open(`http://localhost/Backend_Mem/invoices.php?id=${invoiceId}&pdf=true`, '_blank');
      
      // Refresh data
      fetchInvoices();
      fetchInvoiceSummary();
      toast.success("Invoice marked as printed");
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast.error("Failed to print invoice");
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (field === sortField) {
      return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }
    return null;
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.pages) {
      setPagination({ ...pagination, page });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "printed" | "unprinted");
    // Reset to first page when changing tabs
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <MainLayout requiredRole="facturier">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Factures</h1>
            <p className="text-muted-foreground mt-1">Gérer la visualisation et l'impression de vos factures</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total des factures</CardTitle>
              <CardDescription>Toutes les factures</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{invoiceSummary.printedCount + invoiceSummary.unprintedCount}</p>
              <p className="text-muted-foreground">Valeur total: {formatCurrency(invoiceSummary.totalAmount)}</p>
            </CardContent>
          </Card>
          
          
          
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Toutes les factures</TabsTrigger>
            <TabsTrigger value="unprinted">Non imprimer</TabsTrigger>
            <TabsTrigger value="printed">Imprimer</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("invoice_number")}>
                        <div className="flex items-center">
                          Facture #
                          {getSortIcon("invoice_number")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                        <div className="flex items-center">
                          Date
                          {getSortIcon("date")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("total")}>
                        <div className="flex items-center">
                          Montant
                          {getSortIcon("total")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        <div className="flex items-center">
                          Status
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("printed")}>
                        <div className="flex items-center">
                          Imprimer
                          {getSortIcon("printed")}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Chargement des factures...
                        </TableCell>
                      </TableRow>
                    ) : invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                              {getStatusText(invoice.status)}
                            </span>
                          </TableCell> 
                          <TableCell>
                            {invoice.printed ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Oui
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Non
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1" 
                                onClick={() => handleViewInvoice(invoice.id)}
                              >
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">Voir</span>
                              </Button>
                              
                              
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Aucune facture trouvée 
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {pagination.pages > 1 && (
                <div className="flex justify-center py-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(pagination.page - 1)} 
                          className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === pagination.pages || 
                               (page >= pagination.page - 1 && page <= pagination.page + 1))
                        .map((page, index, array) => {
                          // Add ellipsis
                          if (index > 0 && page - array[index - 1] > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem key={page}>
                                  <PaginationLink 
                                    isActive={page === pagination.page} 
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                isActive={page === pagination.page} 
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(pagination.page + 1)} 
                          className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="unprinted" className="mt-0">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("invoice_number")}>
                        <div className="flex items-center">
                          Invoice #
                          {getSortIcon("invoice_number")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                        <div className="flex items-center">
                          Date
                          {getSortIcon("date")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("total")}>
                        <div className="flex items-center">
                          Amount
                          {getSortIcon("total")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        <div className="flex items-center">
                          Status
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("printed")}>
                        <div className="flex items-center">
                          Printed
                          {getSortIcon("printed")}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : invoices.filter(invoice => !invoice.printed).length > 0 ? (
                      invoices.filter(invoice => !invoice.printed).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                              {getStatusText(invoice.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {invoice.printed ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1" 
                                onClick={() => handleViewInvoice(invoice.id)}
                              >
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              
                              <Button 
                                size="sm"
                                className="flex items-center gap-1" 
                                onClick={() => handlePrintInvoice(invoice.id)}
                                variant={invoice.printed ? "outline" : "default"}
                              >
                                <Printer className="h-3 w-3" />
                                <span className="hidden sm:inline">
                                  {invoice.printed ? "Print Again" : "Print"}
                                </span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No unprinted invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {pagination.pages > 1 && (
                <div className="flex justify-center py-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(pagination.page - 1)} 
                          className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === pagination.pages || 
                               (page >= pagination.page - 1 && page <= pagination.page + 1))
                        .map((page, index, array) => {
                          // Add ellipsis
                          if (index > 0 && page - array[index - 1] > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem key={page}>
                                  <PaginationLink 
                                    isActive={page === pagination.page} 
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                isActive={page === pagination.page} 
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(pagination.page + 1)} 
                          className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="printed" className="mt-0">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("invoice_number")}>
                        <div className="flex items-center">
                          Invoice #
                          {getSortIcon("invoice_number")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                        <div className="flex items-center">
                          Date
                          {getSortIcon("date")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("total")}>
                        <div className="flex items-center">
                          Amount
                          {getSortIcon("total")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        <div className="flex items-center">
                          Status
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("printed")}>
                        <div className="flex items-center">
                          Printed
                          {getSortIcon("printed")}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : invoices.filter(invoice => invoice.printed).length > 0 ? (
                      invoices.filter(invoice => invoice.printed).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                              {getStatusText(invoice.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {invoice.printed ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1" 
                                onClick={() => handleViewInvoice(invoice.id)}
                              >
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              
                              <Button 
                                size="sm"
                                className="flex items-center gap-1" 
                                onClick={() => handlePrintInvoice(invoice.id)}
                                variant={invoice.printed ? "outline" : "default"}
                              >
                                <Printer className="h-3 w-3" />
                                <span className="hidden sm:inline">
                                  {invoice.printed ? "Print Again" : "Print"}
                                </span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Aucune facture imprimée trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {pagination.pages > 1 && (
                <div className="flex justify-center py-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(pagination.page - 1)} 
                          className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === pagination.pages || 
                               (page >= pagination.page - 1 && page <= pagination.page + 1))
                        .map((page, index, array) => {
                          // Add ellipsis
                          if (index > 0 && page - array[index - 1] > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem key={page}>
                                  <PaginationLink 
                                    isActive={page === pagination.page} 
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                isActive={page === pagination.page} 
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(pagination.page + 1)} 
                          className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Détails facture</DialogTitle>
            </DialogHeader>
            {selectedInvoice && <InvoiceView invoice={selectedInvoice} onClose={handleCloseInvoice} />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Invoices;