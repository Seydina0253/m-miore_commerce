import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    console.log("Valeurs soumises :", values); // Log des valeurs soumises
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast.success("Connexion réussie");
        navigate("/dashboard");
      } else {
        toast.error("Email ou mot de passe invalide");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      toast.error("Une erreur s'est produite lors de la connexion : " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-vente-primary">VenteBon</h1>
          <p className="mt-2 text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <div className="mt-8">
          <div className="bg-vente-light p-4 rounded-md text-sm text-gray-700 mb-6">
            <h3 className="font-medium text-vente-primary mb-2">Comptes de Démonstration:</h3>
            <p className="mt-2 text-xs text-gray-500">N'importe quel mot de passe fonctionnera pour la démonstration</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="exemple@societe.com"
                        type="email"
                        {...field}
                      />
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
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez votre mot de passe"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-vente-primary hover:bg-vente-accent"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se Connecter"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;