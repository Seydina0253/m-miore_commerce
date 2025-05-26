import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product, OrderItem } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const formSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  discount: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),
});

type SalesFormValues = z.infer<typeof formSchema>;

interface SalesFormProps {
  onSubmit: (items: OrderItem[], saveAsDraft?: boolean) => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ onSubmit }) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localProductStock, setLocalProductStock] = useState<Record<string, number>>({});

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      discount: 0,
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost/Backend_Mem/products.php");
      setProducts(response.data);
      
      const stockMap: Record<string, number> = {};
      response.data.forEach((product: Product) => {
        stockMap[product.id] = product.stock;
      });
      setLocalProductStock(stockMap);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductStock = async (productId: string, quantity: number) => {
    try {
      const product = products.find(p => p.id.toString() === productId);
      if (!product) return;

      const newStock = product.stock - quantity;
      if (newStock < 0) {
        toast.error(`Not enough stock available for ${product.name}`);
        return false;
      }

      await axios.put(`http://localhost/Backend_Mem/products.php`, {
        id: productId,
        name: product.name,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock: newStock
      });

      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        )
      );

      setLocalProductStock(prev => ({
        ...prev,
        [productId]: newStock
      }));

      return true;
    } catch (error) {
      console.error("Error updating product stock:", error);
      toast.error("Failed to update product stock");
      return false;
    }
  };

  const addItem = async (values: SalesFormValues) => {
    const selectedProduct = products.find(p => p.id.toString() === values.productId);
    
    if (!selectedProduct) {
      toast.error("Product not found");
      return;
    }

    const currentStock = localProductStock[values.productId] ?? selectedProduct.stock;
    
    if (values.quantity > currentStock) {
      toast.error(`Only ${currentStock} units available`);
      return;
    }

    const stockUpdated = await updateProductStock(values.productId, values.quantity);
    if (!stockUpdated) return;

    const itemTotal = parseFloat(
      (selectedProduct.selling_price * values.quantity * (1 - values.discount / 100)).toFixed(2)
    );

    const newItem: OrderItem = {
      productId: selectedProduct.id.toString(),
      productName: selectedProduct.name,
      quantity: values.quantity,
      unitPrice: selectedProduct.selling_price,
      discount: values.discount,
      total: itemTotal,
    };

    setItems(prev => [...prev, newItem]);
    form.reset({ productId: "", quantity: 1, discount: 0 });
  };

  const removeItem = async (index: number) => {
    const item = items[index];
    
    try {
      const product = products.find(p => p.id.toString() === item.productId);
      if (!product) return;
      
      const newStock = (localProductStock[item.productId] ?? product.stock) + item.quantity;
      
      await axios.put(`http://localhost/Backend_Mem/products.php`, {
        id: item.productId,
        name: product.name,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock: newStock
      });
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === item.productId ? { ...p, stock: newStock } : p
        )
      );
      
      setLocalProductStock(prev => ({
        ...prev,
        [item.productId]: newStock
      }));
      
      setItems(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error restoring product stock:", error);
      toast.error("Failed to restore product stock");
    }
  };

  const handleCreateOrder = (saveAsDraft: boolean = false) => {
    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    
    onSubmit(items, saveAsDraft);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="grid md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Produit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner produit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem 
                        key={product.id} 
                        value={product.id.toString()}
                        disabled={(localProductStock[product.id] ?? product.stock) <= 0}
                      >
                        {product.name} ({formatCurrency(product.selling_price)}) - Stock: {localProductStock[product.id] ?? product.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Réduction (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="button"
          onClick={form.handleSubmit(addItem)}
          className="mt-4"
        >
          Ajouter produit
        </Button>
      </Form>

      {items.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap justify-end items-center gap-4">
            <div className="text-lg font-semibold">
              Total: {formatCurrency(items.reduce((sum, item) => sum + item.total, 0))}
            </div>
            <div className="flex gap-3">
              
              <Button 
                className="flex items-center gap-2"
                onClick={() => handleCreateOrder(false)}
              >
                <Printer className="h-4 w-4" />
                Génèrer facture
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesForm;