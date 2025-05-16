
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Payments from "./pages/Payments";
import ProcessVouchers from "./pages/ProcessVouchers";
import ManageVouchers from "./pages/ManageVouchers";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Statistics from "./pages/Statistics";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/vouchers" element={<ProcessVouchers />} />
            <Route path="/manage-vouchers" element={<ManageVouchers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
