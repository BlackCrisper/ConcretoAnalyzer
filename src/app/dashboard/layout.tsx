"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiFileText,
  FiSettings,
  FiBarChart2,
  FiBell,
  FiLogOut,
  FiClock,
  FiShield,
  FiBriefcase,
  FiBox, // Updated import for FiBox
} from 'react-icons/fi';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  href: string;
  children: React.ReactNode;
  permission?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, children, permission }) => {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const active = pathname === href;

  // If permission is required but user doesn't have it, don't render the item
  if (permission && !hasPermission(permission)) {
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {children}
    </Link>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  // If no user, return null (AuthProvider will handle redirect)
  if (!user) return null;

  // Format initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white flex flex-col h-screen sticky top-0">
        {/* Branding */}
        <div className="p-4 border-b flex items-center justify-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Análise Estrutural</span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {getInitials(user.name)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {user.role === 'superadmin'
                    ? 'Super Admin'
                    : user.role === 'admin'
                      ? 'Admin'
                      : 'Usuário'}
                </span>
                {user.role !== 'superadmin' && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {user.company}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem href="/dashboard" permission="view:dashboard">
            <FiHome className="w-4 h-4" />
            <span>Dashboard</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/modelo-3d" permission="view:projects">
            <FiBox className="w-4 h-4" /> {/* Updated icon to FiBox */}
            <span>Modelos 3D</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/novo-projeto" permission="create:project">
            <FiFileText className="w-4 h-4" />
            <span>Novo Projeto</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/clientes" permission="view:clients">
            <FiUsers className="w-4 h-4" />
            <span>Clientes</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/historico" permission="view:projects">
            <FiClock className="w-4 h-4" />
            <span>Histórico</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/relatorios" permission="view:reports">
            <FiFileText className="w-4 h-4" />
            <span>Relatórios</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/metricas" permission="view:reports"> {/* Added new SidebarItem for Metrics */}
            <FiBarChart2 className="w-4 h-4" />
            <span>Métricas</span>
          </SidebarItem>

          <SidebarItem href="/dashboard/notificacoes" permission="manage:notifications">
            <FiBell className="w-4 h-4" />
            <span>Notificações</span>
          </SidebarItem>

          {/* Admin only navigation */}
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administração
                </p>
              </div>

              <SidebarItem href="/dashboard/usuarios" permission="view:users">
                <FiUserPlus className="w-4 h-4" />
                <span>Usuários</span>
              </SidebarItem>

              {user.role === 'superadmin' && (
                <SidebarItem href="/dashboard/empresas" permission="view:companies">
                  <FiBriefcase className="w-4 h-4" />
                  <span>Empresas</span>
                </SidebarItem>
              )}

              <SidebarItem href="/dashboard/permissoes" permission="view:users">
                <FiShield className="w-4 h-4" />
                <span>Permissões</span>
              </SidebarItem>
            </>
          )}

          <SidebarItem href="/dashboard/configuracoes">
            <FiSettings className="w-4 h-4" />
            <span>Configurações</span>
          </SidebarItem>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-red-600 transition-colors w-full justify-start"
            onClick={logout}
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
