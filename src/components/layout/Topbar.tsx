
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Topbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="bg-white border-t border-gray-200 md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a 
              href="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
            >
              Dashboard
            </a>
            {user?.role === "admin" && (
              <>
                <a 
                  href="/products" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Products
                </a>
                <a 
                  href="/users" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Users
                </a>
                <a 
                  href="/statistics" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Statistics
                </a>
              </>
            )}
            {user?.role === "facturier" && (
              <>
                <a 
                  href="/sales" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Sales
                </a>
                <a 
                  href="/invoices" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Invoices
                </a>
              </>
            )}
            {user?.role === "caissier" && (
              <>
                <a 
                  href="/payments" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Payments
                </a>
                <a 
                  href="/vouchers" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Process Vouchers
                </a>
                <a 
                  href="/bilan" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
                >
                  Bilan
                </a>
              </>
            )}
            {user?.role === "gestionnaire_bon" && (
              <a 
                href="/manage-vouchers" 
                className="block px-3 py-2 rounded-md text-base font-medium text-vente-dark hover:bg-vente-secondary"
              >
                Manage Vouchers
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Topbar;