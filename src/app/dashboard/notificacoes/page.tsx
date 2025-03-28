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
  FiUsers,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiSettings
} from "react-icons/fi";
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface para notificações
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'upload' | 'projeto' | 'analise' | 'relatorio' | 'sistema';
  userId: string | null; // null para todos os usuários
  companyId: string | null; // null para todas as empresas
  branchId: string | null; // null para todas as filiais
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'inactive';
  createdAt: string;
  nextRun: string | null;
  lastRun: string | null;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Novo upload disponível",
    message: "Um novo arquivo foi carregado no projeto e está disponível para análise.",
    type: 'upload',
    userId: null,
    companyId: "1",
    branchId: null,
    frequency: 'immediate',
    status: 'active',
    createdAt: "2023-07-15",
    nextRun: null,
    lastRun: null
  },
  {
    id: "2",
    title: "Resumo semanal de projetos",
    message: "Aqui está um resumo dos projetos da sua empresa na última semana.",
    type: 'projeto',
    userId: null,
    companyId: "1",
    branchId: null,
    frequency: 'weekly',
    status: 'active',
    createdAt: "2023-07-10",
    nextRun: "2023-07-17",
    lastRun: "2023-07-10"
  },
  {
    id: "3",
    title: "Análise estrutural concluída",
    message: "A análise estrutural para o seu projeto foi concluída. Verifique os resultados.",
    type: 'analise',
    userId: "3",
    companyId: "1",
    branchId: "1",
    frequency: 'immediate',
    status: 'inactive',
    createdAt: "2023-06-15",
    nextRun: null,
    lastRun: "2023-06-15"
  },
  {
    id: "4",
    title: "Relatório mensal gerado",
    message: "O relatório mensal de atividades foi gerado e está disponível para download.",
    type: 'relatorio',
    userId: null,
    companyId: "2",
    branchId: null,
    frequency: 'monthly',
    status: 'active',
    createdAt: "2023-06-30",
    nextRun: "2023-07-31",
    lastRun: "2023-06-30"
  }
];

export default function NotificacoesPage() {
  const { hasPermission, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newNotification, setNewNotification] = useState<Omit<Notification, 'id' | 'createdAt' | 'nextRun' | 'lastRun'>>({
    title: '',
    message: '',
    type: 'sistema',
    userId: null,
    companyId: user?.role === 'admin' ? user.companyId : null,
    branchId: null,
    frequency: 'immediate',
    status: 'active'
  });

  // Check permission
  const canManageNotifications = hasPermission('manage:notifications') ||
                                user?.role === 'admin' ||
                                user?.role === 'superadmin';

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle notification activation/deactivation
  const toggleNotificationStatus = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              status: notification.status === 'active' ? 'inactive' : 'active'
            }
          : notification
      )
    );
    showSuccess('Status da notificação alterado com sucesso!');
  };

  // Add new notification
  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate next run date based on frequency
    let nextRun: string | null = null;
    const today = new Date();

    switch(newNotification.frequency) {
      case 'daily':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        nextRun = tomorrow.toISOString().split('T')[0];
        break;
      case 'weekly':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextRun = nextWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextRun = nextMonth.toISOString().split('T')[0];
        break;
      case 'immediate':
        nextRun = null;
        break;
    }

    const notificationToAdd: Notification = {
      id: String(Date.now()),
      ...newNotification,
      createdAt: today.toISOString().split('T')[0],
      nextRun,
      lastRun: null
    };

    setNotifications((prevNotifications) => [...prevNotifications, notificationToAdd]);

    // Reset form
    setNewNotification({
      title: '',
      message: '',
      type: 'sistema',
      userId: null,
      companyId: user?.role === 'admin' ? user.companyId : null,
      branchId: null,
      frequency: 'immediate',
      status: 'active'
    });

    setIsCreateDialogOpen(false);
    showSuccess(`Notificação "${notificationToAdd.title}" criada com sucesso!`);
  };

  // Delete notification
  const handleDeleteNotification = () => {
    if (selectedNotification) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== selectedNotification.id)
      );
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
      showSuccess('Notificação excluída com sucesso!');
    }
  };

  // Show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Get notification type display
  const getNotificationType = (type: string) => {
    switch(type) {
      case 'upload': return 'Upload';
      case 'projeto': return 'Projeto';
      case 'analise': return 'Análise';
      case 'relatorio': return 'Relatório';
      case 'sistema': return 'Sistema';
      default: return type;
    }
  };

  // Get notification frequency display
  const getNotificationFrequency = (frequency: string) => {
    switch(frequency) {
      case 'immediate': return 'Imediata';
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Notificações</h1>
          <p className="text-muted-foreground">Configure quando e como os usuários recebem notificações</p>
        </div>

        {canManageNotifications && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FiPlus size={16} />
                <span>Nova Notificação</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurar nova notificação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNotification} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Notificação</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Notificação</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                    >
                      <option value="upload">Upload</option>
                      <option value="projeto">Projeto</option>
                      <option value="analise">Análise</option>
                      <option value="relatorio">Relatório</option>
                      <option value="sistema">Sistema</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <select
                      id="frequency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newNotification.frequency}
                      onChange={(e) => setNewNotification({ ...newNotification, frequency: e.target.value as any })}
                    >
                      <option value="immediate">Imediata</option>
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destinatários</Label>
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allUsers"
                        checked={newNotification.userId === null}
                        onCheckedChange={(checked) =>
                          setNewNotification({ ...newNotification, userId: checked ? null : 'specific' })
                        }
                      />
                      <Label htmlFor="allUsers">Notificar todos os usuários (dentro dos limites de empresa/filial)</Label>
                    </div>

                    {user?.role === 'superadmin' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allCompanies"
                          checked={newNotification.companyId === null}
                          onCheckedChange={(checked) =>
                            setNewNotification({ ...newNotification, companyId: checked ? null : 'specific' })
                          }
                        />
                        <Label htmlFor="allCompanies">Aplicar a todas as empresas</Label>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allBranches"
                        checked={newNotification.branchId === null}
                        onCheckedChange={(checked) =>
                          setNewNotification({ ...newNotification, branchId: checked ? null : 'specific' })
                        }
                        disabled={newNotification.companyId === null}
                      />
                      <Label htmlFor="allBranches" className={newNotification.companyId === null ? "opacity-50" : ""}>
                        Aplicar a todas as filiais {newNotification.companyId === null ? "(desabilitado quando todas as empresas estão selecionadas)" : ""}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newNotification.status === 'active'}
                    onCheckedChange={(checked) =>
                      setNewNotification({ ...newNotification, status: checked ? 'active' : 'inactive' })
                    }
                  />
                  <Label htmlFor="active">Ativar notificação imediatamente</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Notificação</Button>
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

      <Card>
        <CardContent className="p-6">
          <div className="relative w-full mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={16} />
            </div>
            <Input
              className="pl-10"
              type="search"
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Próximo Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        {getNotificationType(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getNotificationFrequency(notification.frequency)}</TableCell>
                    <TableCell>
                      {notification.nextRun ? notification.nextRun : (
                        notification.frequency === 'immediate' ? 'Imediato' : 'Não agendado'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={notification.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {notification.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManageNotifications && (
                          <Button
                            variant={notification.status === 'active' ? 'destructive' : 'outline'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleNotificationStatus(notification.id)}
                            title={notification.status === 'active' ? 'Desativar' : 'Ativar'}
                          >
                            {notification.status === 'active' ? (
                              <FiX className="h-4 w-4" />
                            ) : (
                              <FiCheck className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {notification.status === 'active' ? 'Desativar' : 'Ativar'}
                            </span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Editar notificação"
                        >
                          <FiEdit2 className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>

                        {canManageNotifications && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Excluir notificação"
                          >
                            <FiTrash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredNotifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhuma notificação encontrada
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
              Tem certeza que deseja excluir a notificação{" "}
              <strong>{selectedNotification?.title}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação não pode ser desfeita e a notificação não será mais enviada aos usuários.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotification}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
