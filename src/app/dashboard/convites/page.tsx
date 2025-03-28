"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FiPlus,
  FiSearch,
  FiClock,
  FiRefreshCw,
  FiTrash2,
  FiSend,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiMail,
  FiAlertCircle
} from "react-icons/fi";
import { useAuth, UserRole, Invitation } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card as CardComponent } from "@/components/ui/card";

// Mock invitations data
const mockInvitations: Invitation[] = [
  {
    id: "1",
    email: "novousuario@exemplo.com",
    permissions: ["view:dashboard", "view:projects", "create:project"],
    role: "user" as UserRole,
    status: "pendente",
    expiresAt: "2023-08-15",
    createdAt: "2023-07-15",
    branchId: "1",
    branchName: "Matriz",
    token: "abc123"
  },
  {
    id: "2",
    email: "gerente@exemplo.com",
    permissions: ["view:dashboard", "view:projects", "create:project", "edit:project", "view:clients", "create:client"],
    role: "admin" as UserRole,
    status: "aceito",
    expiresAt: "2023-08-10",
    createdAt: "2023-07-10",
    acceptedAt: "2023-07-11",
    branchId: "2",
    branchName: "Filial São Paulo",
    token: "def456"
  },
  {
    id: "3",
    email: "engenheiro@exemplo.com",
    permissions: ["view:dashboard", "view:projects", "create:project", "edit:project"],
    role: "user" as UserRole,
    status: "expirado",
    expiresAt: "2023-07-05",
    createdAt: "2023-06-05",
    branchId: "3",
    branchName: "Filial Rio",
    token: "ghi789"
  },
  {
    id: "4",
    email: "analista@exemplo.com",
    permissions: ["view:dashboard", "view:projects", "view:reports"],
    role: "user" as UserRole,
    status: "pendente",
    expiresAt: "2023-08-20",
    createdAt: "2023-07-20",
    branchId: "1",
    branchName: "Matriz",
    token: "jkl012"
  }
];

// Permission groups for invitation
const permissionGroups = [
  {
    name: "Dashboard",
    permissions: [
      { id: "view:dashboard", name: "Visualizar Dashboard", description: "Acesso à visualização da dashboard" },
    ]
  },
  {
    name: "Projetos",
    permissions: [
      { id: "view:projects", name: "Visualizar Projetos", description: "Acesso à visualização de projetos" },
      { id: "create:project", name: "Criar Projetos", description: "Permissão para criar novos projetos" },
      { id: "edit:project", name: "Editar Projetos", description: "Permissão para editar projetos existentes" },
      { id: "delete:project", name: "Excluir Projetos", description: "Permissão para excluir projetos" },
    ]
  },
  {
    name: "Clientes",
    permissions: [
      { id: "view:clients", name: "Visualizar Clientes", description: "Acesso à visualização de clientes" },
      { id: "create:client", name: "Criar Clientes", description: "Permissão para criar novos clientes" },
      { id: "edit:client", name: "Editar Clientes", description: "Permissão para editar clientes existentes" },
      { id: "delete:client", name: "Excluir Clientes", description: "Permissão para excluir clientes" },
    ]
  },
  {
    name: "Relatórios",
    permissions: [
      { id: "view:reports", name: "Visualizar Relatórios", description: "Acesso à visualização de relatórios" },
      { id: "create:report", name: "Gerar Relatórios", description: "Permissão para gerar novos relatórios" },
      { id: "export:report", name: "Exportar Relatórios", description: "Permissão para exportar relatórios" },
    ]
  },
  {
    name: "Financeiro",
    permissions: [
      { id: "view:financial", name: "Visualizar Financeiro", description: "Acesso à visualização de dados financeiros" },
      { id: "edit:financial", name: "Editar Financeiro", description: "Permissão para editar dados financeiros" },
    ]
  },
  {
    name: "Notificações",
    permissions: [
      { id: "manage:notifications", name: "Gerenciar Notificações", description: "Permissão para configurar notificações" },
    ]
  }
];

// Mock company branches
const companyBranches = [
  { id: "1", name: "Matriz" },
  { id: "2", name: "Filial São Paulo" },
  { id: "3", name: "Filial Rio" },
  { id: "4", name: "Filial Norte" }
];

export default function ConvitesPage() {
  const { hasPermission, user, createInvitation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [invitations, setInvitations] = useState(mockInvitations);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'user' as UserRole,
    permissions: ['view:dashboard'],
    branchId: '1',
    branchName: 'Matriz',
    expirationDays: 30
  });
  const [previewUrl, setPreviewUrl] = useState('');

  // Check user permission
  const canManageInvitations = hasPermission('manage:invitations') ||
                              user?.role === 'admin' ||
                              user?.role === 'superadmin';

  // Search filter
  const filteredInvitations = searchTerm
    ? invitations.filter(
        (invitation) =>
          invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invitation.branchName && invitation.branchName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : invitations;

  // Handle invitation deletion
  const handleDeleteInvitation = () => {
    if (selectedInvitation) {
      setInvitations(invitations.filter(i => i.id !== selectedInvitation.id));
      setIsDeleteDialogOpen(false);
      setSelectedInvitation(null);
      showSuccess('Convite excluído com sucesso');
    }
  };

  // Handle invitation resend/renewal
  const handleRenewInvitation = (invitationId: string) => {
    setInvitations(invitations.map(i => {
      if (i.id === invitationId) {
        // Add 30 days to the current date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Format date as YYYY-MM-DD
        const formattedDate = expiryDate.toISOString().split('T')[0];

        return {
          ...i,
          status: 'pendente',
          expiresAt: formattedDate
        };
      }
      return i;
    }));

    showSuccess('Convite renovado com sucesso. Um novo e-mail será enviado.');
  };

  // Create a new invitation
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create expiration date (days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(newInvitation.expirationDays.toString()));
      const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

      // Find branch name
      const branch = companyBranches.find(b => b.id === newInvitation.branchId);

      // Create invitation data to send to API
      const invitationData = {
        email: newInvitation.email,
        permissions: newInvitation.permissions,
        role: newInvitation.role as UserRole,
        branchId: newInvitation.branchId,
        expiresAt: formattedExpiryDate,
      };

      // Call API to create invitation (uses the auth context function)
      const createdInvitation = await createInvitation(invitationData);

      // Add branch name for display
      const invitationWithBranch = {
        ...createdInvitation,
        branchName: branch?.name || 'Desconhecida',
        acceptedAt: createdInvitation.status === 'aceito' ? new Date().toISOString() : undefined
      };

      setInvitations([...invitations, invitationWithBranch]);

      // Reset form
      setNewInvitation({
        email: '',
        role: 'user' as UserRole,
        permissions: ['view:dashboard'],
        branchId: '1',
        branchName: 'Matriz',
        expirationDays: 30
      });

      setIsCreateDialogOpen(false);
      showSuccess('Convite enviado com sucesso para ' + invitationWithBranch.email);

    } catch (error) {
      showError('Erro ao criar convite. Por favor, tente novamente.');
      console.error('Error creating invitation:', error);
    }
  };

  // Handle permission toggle
  const togglePermission = (permissionId: string) => {
    setNewInvitation(prev => {
      if (prev.permissions.includes(permissionId)) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== permissionId)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId]
        };
      }
    });
  };

  // Show preview of invitation link
  const handleShowPreview = (invitation: any) => {
    // In a real app, this would be your app's domain
    const baseUrl = window.location.origin;
    // Generate a preview URL with the token
    const url = `${baseUrl}/aceitar-convite?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`;
    setPreviewUrl(url);
    setIsPreviewDialogOpen(true);
  };

  // Handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    const branch = companyBranches.find(b => b.id === branchId);

    setNewInvitation({
      ...newInvitation,
      branchId: branchId,
      branchName: branch?.name || 'Desconhecida'
    });
  };

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Show error message temporarily
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => {
      setShowErrorMessage(false);
    }, 3000);
  };

  // Get the style for the status badge
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aceito':
        return 'bg-green-100 text-green-800';
      case 'expirado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Convites</h1>
          <p className="text-muted-foreground">Envie convites personalizados para novos usuários e gerencie suas permissões</p>
        </div>

        {canManageInvitations && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FiPlus size={16} />
                <span>Novo Convite</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar convite personalizado para novo usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInvitation} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={newInvitation.email}
                      onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Filial/Unidade</Label>
                    <select
                      id="branch"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newInvitation.branchId}
                      onChange={handleBranchChange}
                    >
                      {companyBranches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <select
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newInvitation.role}
                      onChange={(e) => setNewInvitation({ ...newInvitation, role: e.target.value as UserRole })}
                    >
                      <option value="user">Usuário</option>
                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <option value="admin">Administrador</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expirationDays">Dias para expiração</Label>
                    <Input
                      id="expirationDays"
                      type="number"
                      min="1"
                      max="90"
                      value={newInvitation.expirationDays}
                      onChange={(e) => setNewInvitation({ ...newInvitation, expirationDays: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <CardComponent className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <FiAlertCircle className="text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Informação:</p>
                          <p className="text-sm text-blue-600">
                            O usuário receberá um e-mail com link de convite único que expirará em {newInvitation.expirationDays} dias.
                            Ao aceitar, ele criará sua própria senha e terá acesso às permissões que você configurar abaixo.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </CardComponent>
                </div>

                <div className="space-y-2">
                  <Label>Permissões</Label>
                  <div className="border rounded-md">
                    <div className="bg-muted/50 p-3 border-b">
                      <h3 className="font-medium">Configure as permissões que o usuário terá ao aceitar o convite</h3>
                    </div>
                    <div className="divide-y">
                      {permissionGroups.map((group) => (
                        <div key={group.name} className="p-4">
                          <h4 className="font-medium mb-2">{group.name}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {group.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={newInvitation.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <Label htmlFor={permission.id} className="cursor-pointer">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Enviar Convite</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FiCheck className="mr-2" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FiX className="mr-2" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="relative w-full mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={16} />
            </div>
            <Input
              className="pl-10"
              type="search"
              placeholder="Buscar convites por email ou filial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={invitation.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {invitation.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>{invitation.branchName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeStyle(invitation.status)}
                      >
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{invitation.createdAt}</TableCell>
                    <TableCell>{invitation.expiresAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invitation.status === 'expirado' && canManageInvitations && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Renovar convite expirado"
                            onClick={() => handleRenewInvitation(invitation.id)}
                          >
                            <FiRefreshCw className="h-4 w-4" />
                            <span className="sr-only">Renovar</span>
                          </Button>
                        )}

                        {invitation.status === 'pendente' && canManageInvitations && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Reenviar convite"
                            onClick={() => showSuccess('Email de convite reenviado para ' + invitation.email)}
                          >
                            <FiSend className="h-4 w-4" />
                            <span className="sr-only">Reenviar</span>
                          </Button>
                        )}

                        {canManageInvitations && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Ver link do convite"
                            onClick={() => handleShowPreview(invitation)}
                          >
                            <FiMail className="h-4 w-4" />
                            <span className="sr-only">Ver link</span>
                          </Button>
                        )}

                        {canManageInvitations && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Excluir convite"
                            onClick={() => {
                              setSelectedInvitation(invitation);
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

                {filteredInvitations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum convite encontrado
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
              Tem certeza que deseja excluir o convite para{" "}
              <strong>{selectedInvitation?.email}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteInvitation}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitation link preview dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiMail className="text-blue-500" />
              Link de Convite
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Link para compartilhar com o usuário:</p>
            <div className="p-3 bg-gray-100 rounded-md break-all text-sm">
              {previewUrl}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Este link foi enviado automaticamente para o email do usuário.
              Você pode copiá-lo e compartilhar novamente se necessário.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(previewUrl);
                showSuccess('Link copiado para a área de transferência');
                setIsPreviewDialogOpen(false);
              }}
            >
              Copiar Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
