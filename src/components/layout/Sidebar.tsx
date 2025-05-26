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
  LogOut 
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
      isActive 
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 border-l-4 border-white" 
        : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md"
    }`;

  const iconClass = "transition-transform duration-300 group-hover:rotate-12";

  return (
    <div className="w-72 flex-shrink-0 hidden lg:block bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-r border-blue-200/50 shadow-2xl overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header avec effet glassmorphism */}
        
        
        {/* Profil utilisateur avec avatar élégant */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-500/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-white/30">
                {user?.name.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-lg">{user?.name}</p>
              <p className="text-sm text-blue-100 capitalize bg-white/20 px-2 py-1 rounded-full inline-block mt-1">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation avec animations fluides */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</h3>
          </div>
          
          <NavLink to="/dashboard" className={navLinkClass}>
            <Home size={20} className={iconClass} />
            <span className="font-medium">Tableau de Bord</span>
          </NavLink>
          
          {user?.role === "admin" && (
            <div className="space-y-2">
              <div className="mt-6 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Administration</h3>
              </div>
              
              <NavLink to="/products" className={navLinkClass}>
                <Package size={20} className={iconClass} />
                <span className="font-medium">Produits</span>
              </NavLink>
              
              <NavLink to="/users" className={navLinkClass}>
                <Users size={20} className={iconClass} />
                <span className="font-medium">Utilisateurs</span>
              </NavLink>
              
              <NavLink to="/statistics" className={navLinkClass}>
                <BarChart4 size={20} className={iconClass} />
                <span className="font-medium">Statistiques</span>
              </NavLink>
            </div>
          )}

          {user?.role === "facturier" && (
            <div className="space-y-2">
              <div className="mt-6 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Facturation</h3>
              </div>
              
              <NavLink to="/sales" className={navLinkClass}>
                <ShoppingCart size={20} className={iconClass} />
                <span className="font-medium">Ventes</span>
              </NavLink>
              
              <NavLink to="/invoices" className={navLinkClass}>
                <FileText size={20} className={iconClass} />
                <span className="font-medium">Factures</span>
              </NavLink>
            </div>
          )}

          {user?.role === "caissier" && (
            <div className="space-y-2">
              <div className="mt-6 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Paiements</h3>
              </div>
              
              <NavLink to="/payments" className={navLinkClass}>
                <CreditCard size={20} className={iconClass} />
                <span className="font-medium">Paiement de Facture</span>
              </NavLink>
              
              <NavLink to="/vouchers" className={navLinkClass}>
                <Receipt size={20} className={iconClass} />
                <span className="font-medium">Paiement de Bon</span>
              </NavLink>
            </div>
          )}

          {user?.role === "gestionnaire_bon" && (
            <div className="space-y-2">
              <div className="mt-6 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Gestion</h3>
              </div>
              
              <NavLink to="/manage-vouchers" className={navLinkClass}>
                <Receipt size={20} className={iconClass} />
                <span className="font-medium">Gestion des Bons</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bouton de déconnexion avec effet hover élégant */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
          <button
            onClick={() => logout()}
            className="group flex w-full items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-red-200 active:scale-95"
          >
            <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium">Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;