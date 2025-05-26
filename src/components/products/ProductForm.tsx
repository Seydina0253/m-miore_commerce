import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Product } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  purchase_price: z.coerce.number().min(0, "Purchase price must be a positive number"),
  selling_price: z.coerce.number().min(0, "Selling price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be a non-negative number"),
}).refine(data => data.selling_price > data.purchase_price, {
  message: "Selling price must be greater than purchase price",
  path: ["selling_price"],
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? {
          name: product.name,
          purchase_price: product.purchase_price,
          selling_price: product.selling_price,
          stock: product.stock,
        }
      : {
          name: "",
          purchase_price: 0,
          selling_price: 0,
          stock: 0,
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input placeholder="Entrer nom du produit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix d'achat</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder=""
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selling_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix de vente</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder=""
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value) || 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-vente-primary hover:bg-vente-accent">
          {product ? "Modifier Produit" : "Ajouter Produit"}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;