"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiCheck,
  FiX,
  FiAlertTriangle
} from "react-icons/fi";
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "Admin",
    email: "admin@exemplo.com",
    role: "admin" as const,
    active: true,
    company: "Empresa Principal",
    lastLogin: "2023-07-15 14:30",
  },
  {
    id: "3",
    name: "Usuário Comum",
    email: "user@exemplo.com",
    role: "user" as const,
    active: true,
    company: "Empresa Principal",
    lastLogin: "2023-07-20 09:15",
  },
  {
    id: "4",
    name: "Ana Silva",
    email: "ana.silva@exemplo.com",
    role: "user" as const,
    active: true,
    company: "Empresa Principal",
    lastLogin: "2023-07-18 11:22",
  },
  {
    id: "5",
    name: "Carlos Mendes",
    email: "carlos@exemplo.com",
    role: "user" as const,
    active: false,
    company: "Empresa Principal",
    lastLogin: "2023-06-30 16:45",
  },
  {
    id: "6",
    name: "Mariana Costa",
    email: "mariana@exemplo.com",
    role: "admin" as const,
    active: true,
    company: "Empresa Principal",
    lastLogin: "2023-07-22 08:30",
  },
];

export default function UsuariosPage() {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as const,
    password: '',
    active: true,
  });

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user activation/deactivation
  const toggleUserStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, active: !user.active } : user
      )
    );
  };

  // Add new user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = String(Date.now());
    const userToAdd = {
      id: newId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      active: newUser.active,
      company: user?.company || 'Empresa Principal',
      lastLogin: '-',
    };

    setUsers((prevUsers) => [...prevUsers, userToAdd]);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      password: '',
      active: true,
    });
  };

  // Delete user
  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>

        {hasPermission('create:user') && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FiPlus size={16} />
                <span>Novo Usuário</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha temporária</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  >
                    <option value="user">Usuário</option>
                    {user?.role === 'admin' || user?.role === 'superadmin' ? (
                      <option value="admin">Administrador</option>
                    ) : null}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newUser.active}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, active: checked })}
                  />
                  <Label htmlFor="active">Usuário ativo</Label>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Adicionar Usuário</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative w-full mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={16} />
            </div>
            <Input
              className="pl-10"
              type="search"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {user.role === 'admin'
                          ? 'Administrador'
                          : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission('edit:user') && (
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <FiEdit2 className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        )}

                        {hasPermission('edit:user') && (
                          <Button
                            variant={user.active ? 'destructive' : 'outline'}
                            size="sm"
                            className={`h-8 w-8 p-0 ${user.active ? 'hover:bg-red-600' : 'hover:bg-green-600'}`}
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.active ? (
                              <FiX className="h-4 w-4" />
                            ) : (
                              <FiCheck className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {user.active ? 'Desativar' : 'Ativar'}
                            </span>
                          </Button>
                        )}

                        {hasPermission('delete:user') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <FiTrash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" />
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
