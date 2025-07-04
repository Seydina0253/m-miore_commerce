
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "caissier" | "facturier" | "gestionnaire_bon";
  password?: string;
}

export interface Product {
  id: string;
  name: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  date: string;
  invoiceNumber: string;
  status: "pending" | "paid" | "cancelled";
  printed?: boolean;
}
export interface ProductProfit {
  productId: string;
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}
export interface Invoice extends Order {
  // À ajouter si vous avez besoin de données supplémentaires pour les factures
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod?: string;
  notes?: string;
}
export interface InvoiceSummary {
  totalPrinted: number;
  totalAmount: number;
  printedCount: number;
  unprintedCount: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Voucher {
  id: string;
  type: "expense" | "output" | "entry";
  amount: number;
  voucher_number: string;
  date: string;
  description: string;
  status: "pending" | "processed" | "rejected";
  printed?: boolean;
}

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalVouchers: number;
  recentOrders: Order[];
}
