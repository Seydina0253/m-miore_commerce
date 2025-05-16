
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Accès Non Autorisé</h2>
          <p className="mt-4 text-gray-600 text-center">
            Vous n'avez pas la permission d'accéder à cette page. Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full">
            <Button
              className="bg-vente-primary hover:bg-vente-accent flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Aller au Tableau de Bord
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Retour à la Connexion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
