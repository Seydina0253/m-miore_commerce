import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  ShoppingCart, 
  Package, 
  FileText, 
  CreditCard, 
  Receipt, 
  Users, 
  BarChart4, 
  Settings, 
  LogOut 
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
      isActive 
        ? "bg-vente-primary text-white" 
        : "text-vente-dark hover:bg-vente-secondary"
    }`;

  return (
    <div className="w-64 flex-shrink-0 hidden md:block bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-vente-primary">VenteBon System</h2>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vente-primary text-white rounded-full flex items-center justify-center font-semibold">
              {user?.name.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" className={navLinkClass}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          {user?.role === "admin" && (
            <>
              <NavLink to="/products" className={navLinkClass}>
                <Package size={18} />
                <span>Products</span>
              </NavLink>
              
              <NavLink to="/users" className={navLinkClass}>
                <Users size={18} />
                <span>Users</span>
              </NavLink>
              
              <NavLink to="/statistics" className={navLinkClass}>
                <BarChart4 size={18} />
                <span>Statistics</span>
              </NavLink>
            </>
          )}

          {user?.role === "facturier" && (
            <>
              <NavLink to="/sales" className={navLinkClass}>
                <ShoppingCart size={18} />
                <span>Sales</span>
              </NavLink>
              
              <NavLink to="/invoices" className={navLinkClass}>
                <FileText size={18} />
                <span>Invoices</span>
              </NavLink>
            </>
          )}

          {user?.role === "caissier" && (
            <>
              <NavLink to="/payments" className={navLinkClass}>
                <CreditCard size={18} />
                <span>Payments</span>
              </NavLink>
              
              <NavLink to="/vouchers" className={navLinkClass}>
                <Receipt size={18} />
                <span>Process Vouchers</span>
              </NavLink>
            </>
          )}

          {user?.role === "gestionnaire_bon" && (
            <NavLink to="/manage-vouchers" className={navLinkClass}>
              <Receipt size={18} />
              <span>Manage Vouchers</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-2 text-vente-danger rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
