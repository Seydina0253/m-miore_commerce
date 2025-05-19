import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { User } from "@/types"; 
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, UserCog, UserX } from "lucide-react";
import { UserForm } from "@/components/users/UserForm";

const API_URL = "http://localhost/Backend_Mem/api.php";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setUsers(data);
  };

  const handleAddUser = async (user: User) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      await fetchUsers(); // Refresh the user list
      setIsAddOpen(false);
    } else {
      const errorData = await response.json();
      alert("Erreur: " + errorData.message);
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    const response = await fetch(`${API_URL}?id=${updatedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    if (response.ok) {
      await fetchUsers(); // Refresh the user list
      setIsEditOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      const response = await fetch(`${API_URL}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id)); // Update state to remove user
      } else {
        const errorData = await response.json();
        alert("Erreur: " + errorData.message);
      }
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  return (
    <MainLayout requiredRole="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-25 bg-vente-primary hover:bg-vente-accent">
              <UserPlus size={18} />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <UserForm onSubmit={handleAddUser} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(user)}
                      >
                        <UserCog size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <UserX size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && <UserForm user={selectedUser} onSubmit={handleEditUser} />}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Users;