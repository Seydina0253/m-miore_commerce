import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LogIn, Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast.success("Connexion réussie");
        navigate("/dashboard");
      } else {
        toast.error("Email ou mot de passe invalide");
      }
    } catch (error) {
      toast.error("Une erreur s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@example.com', role: 'Administrateur', color: 'bg-purple-500' },
    { email: 'facturier@example.com', role: 'Facturier', color: 'bg-blue-500' },
    { email: 'caissier@example.com', role: 'Caissier', color: 'bg-green-500' },
    { email: 'gestionnaire@example.com', role: 'Gestionnaire', color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* En-tête */}
          <div className="text-center mb-8">
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              ENTREPRISE 
            </h1>
            <p className="text-gray-600 text-lg">Connectez-vous à votre espace</p>
          </div>

          {/* Carte de connexion */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            {/* Message de bienvenue */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                
                <h3 className="font-semibold text-blue-800">BIENVENUE</h3>
              </div>
              <p className="text-blue-600 text-sm leading-relaxed">
                Veuillez remplir correctement vos informations pour accéder à votre espace de gestion
              </p>
            </div>

            {/* Formulaire */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Adresse email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            placeholder="exemple@societe.com"
                            type="email"
                            className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            placeholder="Entrez votre mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connexion en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn size={18} />
                      Se Connecter
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Section droite - Informations (cachée sur mobile) */}
      
    </div>
  );
};

export default Login;