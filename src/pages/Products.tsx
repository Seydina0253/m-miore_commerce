import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProductForm from "@/components/products/ProductForm";
import { Product } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash } from "lucide-react"; 
import { toast } from "sonner";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost/Backend_Mem/products.php");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const handleAddProduct = async (data: Omit<Product, "id">) => {
    try {
      if (data.stock < 0) {
        toast.error("Stock cannot be negative");
        return;
      }

      if (data.selling_price <= data.purchase_price) {
        toast.error("Le prix de vente doit être supérieur au prix d'achat");
        return;
      }

      const response = await axios.post("http://localhost/Backend_Mem/products.php", data);
      setProducts([...products, response.data]);
      toast.success("Product added successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async (data: Omit<Product, "id">) => {
    if (!editingProduct) return;

    try {
      if (data.stock < 0) {
        toast.error("Stock cannot be negative");
        return;
      }

      if (data.selling_price <= data.purchase_price) {
        toast.error("Le prix de vente doit être supérieur au prix d'achat");
        return;
      }

      const response = await axios.put(`http://localhost/Backend_Mem/products.php`, {
        id: editingProduct.id,
        ...data
      });
      
      const updatedProducts = products.map(product => 
        product.id === editingProduct.id ? { ...product, ...response.data } : product
      );
      
      setProducts(updatedProducts);
      toast.success("Product updated successfully");
      setEditingProduct(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`http://localhost/Backend_Mem/products.php?id=${id}`);
      setProducts(products.filter(product => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-vente-dark">Liste des produits</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-vente-primary hover:bg-vente-accent">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Modifier produit" : "Ajouter un nouveau produit"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct || undefined}
                onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher produits..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prix d'achat</TableHead>
                <TableHead>Prix de vente</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.purchase_price)}</TableCell>
                    <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                    <TableCell>
                      <span className={product.stock <= 5 ? "text-red-500 font-bold" : ""}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsDialogOpen(true);
                          }}
                          className="text-vente-accent hover:text-vente-primary"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-vente-danger hover:text-red-700"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;