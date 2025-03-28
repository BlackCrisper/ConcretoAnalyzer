"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FiSearch, FiSave, FiAlertCircle, FiLock, FiShield, FiCheck, FiUser, FiInfo, FiStar, FiFilter } from 'react-icons/fi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth, UserRole } from '@/contexts/auth-context';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

interface PermissionGroup {
  name: string;
  permissions: {
    id: string;
    name: string;
    description: string;
  }[];
}

// Mock users data with proper types
const mockUsers = [
  {
    id: "1",
    name: "Admin",
    email: "admin@exemplo.com",
    role: "admin" as UserRole,
    branchId: "1",
    branchName: "Matriz"
  },
  {
    id: "3",
    name: "Usuário Comum",
    email: "user@exemplo.com",
    role: "user" as UserRole,
    branchId: "1",
    branchName: "Matriz"
  },
  {
    id: "4",
    name: "Ana Silva",
    email: "ana.silva@exemplo.com",
    role: "user" as UserRole,
    branchId: "2",
    branchName: "Filial São Paulo"
  },
  {
    id: "5",
    name: "Carlos Mendes",
    email: "carlos@exemplo.com",
    role: "user" as UserRole,
    branchId: "3",
    branchName: "Filial Rio"
  },
  {
    id: "6",
    name: "Mariana Costa",
    email: "mariana@exemplo.com",
    role: "admin" as UserRole,
    branchId: "2",
    branchName: "Filial São Paulo"
  },
];

const permissionGroups: PermissionGroup[] = [
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
    name: "Usuários",
    permissions: [
      { id: "view:users", name: "Visualizar Usuários", description: "Acesso à visualização de usuários" },
      { id: "create:user", name: "Criar Usuários", description: "Permissão para criar novos usuários" },
      { id: "edit:user", name: "Editar Usuários", description: "Permissão para editar usuários existentes" },
      { id: "delete:user", name: "Excluir Usuários", description: "Permissão para excluir usuários" },
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
    name: "Gerenciamento",
    permissions: [
      { id: "manage:invitations", name: "Gerenciar Convites", description: "Permissão para gerenciar convites" },
      { id: "manage:branches", name: "Gerenciar Filiais", description: "Permissão para gerenciar filiais" },
      { id: "manage:notifications", name: "Gerenciar Notificações", description: "Permissão para gerenciar notificações" },
    ]
  }
];

// Initial user permissions (mocked data based on roles)
const initialUserPermissions = {
  "1": ["view:dashboard", "view:projects", "create:project", "edit:project", "delete:project",
        "view:clients", "create:client", "edit:client", "delete:client",
        "view:reports", "create:report", "export:report",
        "view:users", "create:user", "edit:user", "delete:user",
        "manage:invitations", "manage:branches", "manage:notifications"],
  "3": ["view:dashboard", "view:projects", "create:project", "edit:project",
        "view:clients",
        "view:reports"],
  "4": ["view:dashboard", "view:projects", "create:project",
        "view:clients",
        "view:reports",
        "view:financial"],
  "5": ["view:dashboard", "view:projects",
        "view:clients",
        "view:reports"],
  "6": ["view:dashboard", "view:projects", "create:project", "edit:project", "delete:project",
        "view:clients", "create:client", "edit:client", "delete:client",
        "view:reports", "create:report", "export:report",
        "view:users", "create:user", "edit:user",
        "manage:invitations"]
};

// Filtros de permissões predefinidos
const permissionsTemplates = [
  {
    name: "Apenas Visualização",
    permissions: ["view:dashboard", "view:projects", "view:clients", "view:reports"]
  },
  {
    name: "Usuário Padrão",
    permissions: ["view:dashboard", "view:projects", "create:project", "edit:project", "view:clients", "view:reports"]
  },
  {
    name: "Gerente de Projetos",
    permissions: ["view:dashboard", "view:projects", "create:project", "edit:project", "delete:project",
                 "view:clients", "create:client", "edit:client", "view:reports", "create:report", "export:report"]
  },
  {
    name: "Administrador de Filial",
    permissions: ["view:dashboard", "view:projects", "create:project", "edit:project", "delete:project",
                 "view:clients", "create:client", "edit:client", "delete:client",
                 "view:reports", "create:report", "export:report",
                 "view:users", "create:user", "edit:user",
                 "manage:invitations", "manage:branches"]
  }
];

export default function PermissoesPage() {
  const { hasPermission, user, updateUserPermissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>(initialUserPermissions);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [permissionChanges, setPermissionChanges] = useState<Record<string, boolean>>({});

  // Filter users based on search term and branch
  const filteredUsers = mockUsers.filter(
    (user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = branchFilter === 'all' || user.branchId === branchFilter;

      return matchesSearch && matchesBranch;
    }
  );

  // Available branches for filtering
  const branches = [
    { id: "all", name: "Todas as Filiais" },
    { id: "1", name: "Matriz" },
    { id: "2", name: "Filial São Paulo" },
    { id: "3", name: "Filial Rio" },
  ];

  // Handle permission toggle
  const togglePermission = (userId: string, permissionId: string) => {
    setUserPermissions(prev => {
      const userPerms = [...(prev[userId] || [])];

      if (userPerms.includes(permissionId)) {
        // Track change
        setPermissionChanges(prev => ({
          ...prev,
          [`${userId}-${permissionId}`]: false
        }));
        return {
          ...prev,
          [userId]: userPerms.filter(p => p !== permissionId)
        };
      } else {
        // Track change
        setPermissionChanges(prev => ({
          ...prev,
          [`${userId}-${permissionId}`]: true
        }));
        return {
          ...prev,
          [userId]: [...userPerms, permissionId]
        };
      }
    });
  };

  // Apply permission template
  const applyTemplate = (templateName: string) => {
    if (!selectedUserId) return;

    const template = permissionsTemplates.find(t => t.name === templateName);
    if (!template) return;

    setUserPermissions(prev => ({
      ...prev,
      [selectedUserId]: [...template.permissions]
    }));

    setIsTemplateDialogOpen(false);
  };

  // Handle save permissions
  const savePermissions = async () => {
    if (selectedUserId) {
      try {
        // In a real app, this would call an API endpoint to save the permissions
        const success = await updateUserPermissions(selectedUserId, userPermissions[selectedUserId] || []);

        if (success) {
          // Clear tracked changes
          setPermissionChanges({});

          // Show success message
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
      }
    }
  };

  // Check if a permission for the selected user has been changed
  const hasPermissionChanged = (permissionId: string): boolean => {
    if (!selectedUserId) return false;
    return !!permissionChanges[`${selectedUserId}-${permissionId}`];
  };

  // Get selected user data
  const selectedUser = selectedUserId
    ? mockUsers.find(u => u.id === selectedUserId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permissões de Usuários</h1>
        <p className="text-muted-foreground">Gerencie as permissões de acesso granulares para cada usuário</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Users list */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-center">
              <span>Usuários</span>
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="flex h-8 text-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8 appearance-none"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                <FiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative w-full mb-4">
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

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUserId === user.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1 text-left flex flex-col">
                      <span>{user.name}</span>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground">Filial: {user.branchName}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        user.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {user.role === 'admin'
                        ? 'Admin'
                        : 'User'}
                    </Badge>
                  </div>
                </Button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FiUser size={40} className="mx-auto mb-2 opacity-20" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions management */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FiLock size={20} />
              <span>
                {selectedUser
                  ? `Permissões para ${selectedUser.name}`
                  : 'Selecione um usuário'}
              </span>
            </CardTitle>

            {selectedUser && (
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <Button
                    variant="outline"
                    onClick={() => setIsTemplateDialogOpen(true)}
                    className="flex items-center gap-1"
                    disabled={!selectedUserId}
                  >
                    <FiStar size={16} />
                    <span>Aplicar Modelo</span>
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aplicar Modelo de Permissões</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Escolha um modelo pré-definido de permissões para aplicar a <strong>{selectedUser?.name}</strong>.
                        Isso substituirá todas as permissões atuais do usuário.
                      </p>
                      <div className="space-y-2">
                        {permissionsTemplates.map((template) => (
                          <Card key={template.name} className="cursor-pointer hover:bg-accent/50" onClick={() => applyTemplate(template.name)}>
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{template.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {template.permissions.length} permissões incluídas
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Aplicar
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={savePermissions}
                  className="flex items-center gap-2"
                  disabled={!selectedUserId}
                >
                  <FiSave size={16} />
                  <span>Salvar</span>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {showSuccessMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                <div className="flex items-center">
                  <FiCheck className="mr-2" />
                  <span>Permissões salvas com sucesso!</span>
                </div>
              </div>
            )}

            {!selectedUser ? (
              <div className="text-center py-8 text-muted-foreground">
                <FiShield size={40} className="mx-auto mb-2 opacity-20" />
                <p>Selecione um usuário para gerenciar suas permissões</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
                  <div className="flex items-start gap-2">
                    <FiInfo className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Permissões granulares</p>
                      <p className="text-sm">
                        Configure exatamente quais ações este usuário pode realizar no sistema,
                        independentemente do papel (role) atribuído. As permissões são aplicadas imediatamente após salvar.
                      </p>
                    </div>
                  </div>
                </div>

                {permissionGroups.map((group) => (
                  <div key={group.name} className="border rounded-md">
                    <div className="bg-muted/50 p-3 border-b">
                      <h3 className="font-medium">{group.name}</h3>
                    </div>
                    <div className="divide-y">
                      {group.permissions.map((permission) => {
                        const isActive = selectedUserId ?
                          (userPermissions[selectedUserId]?.includes(permission.id) || false) :
                          false;

                        const hasChanged = hasPermissionChanged(permission.id);

                        return (
                          <div key={permission.id} className="p-3 flex items-center justify-between">
                            <div>
                              <Label className={`font-medium ${hasChanged ? 'text-blue-600' : ''}`}>
                                {permission.name}
                                {hasChanged && <span className="ml-2 text-xs text-blue-500">(alterado)</span>}
                              </Label>
                              <p className="text-sm text-muted-foreground">{permission.description}</p>
                            </div>
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => selectedUserId && togglePermission(selectedUserId, permission.id)}
                              className={hasChanged ? 'data-[state=checked]:bg-blue-500' : ''}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
