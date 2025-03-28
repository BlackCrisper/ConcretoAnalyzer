"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from '@/components/dashboard/stat-card';
import { BarChart } from '@/components/dashboard/bar-chart';
import { LineChart } from '@/components/dashboard/line-chart';
import { PieChart } from '@/components/dashboard/pie-chart';
import { ProjectList } from '@/components/dashboard/project-list';
import { ActionCard } from '@/components/dashboard/action-card';
import {
  FiFileText,
  FiUsers,
  FiClock,
  FiAlertTriangle,
  FiBarChart2,
  FiBriefcase,
  FiUserPlus,
  FiSettings,
  FiActivity
} from 'react-icons/fi';
import { useAuth } from '@/contexts/auth-context';

// Mock data for charts
const monthlyProjectsData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Projetos',
      data: [4, 3, 5, 7, 0, 0, 0],
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
    },
  ],
};

const clientDistributionData = {
  labels: ['Comercial', 'Residencial', 'Industrial'],
  datasets: [
    {
      label: 'Clientes',
      data: [12, 8, 4],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(249, 168, 37, 0.7)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(249, 168, 37, 1)',
      ],
    },
  ],
};

const complianceData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Conformes',
      data: [3, 2, 2.5, 5, 6, 2, 5],
      borderColor: 'rgba(74, 222, 128, 1)',
      backgroundColor: 'rgba(74, 222, 128, 0.5)',
    },
    {
      label: 'Não Conformes',
      data: [1, 1, 1, 1, 1, 1, 1],
      borderColor: 'rgba(248, 113, 113, 1)',
      backgroundColor: 'rgba(248, 113, 113, 0.5)',
    },
  ],
};

// Super Admin company data
const companiesData = {
  labels: ['Empresa Principal', 'Construtora Horizonte', 'Incorporadora VitaPlus', 'MultiTech', 'Vision'],
  datasets: [
    {
      label: 'Projetos',
      data: [42, 12, 8, 5, 7],
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
    },
    {
      label: 'Usuários',
      data: [6, 8, 4, 2, 3],
      backgroundColor: 'rgba(249, 115, 22, 0.7)',
    },
  ],
};

// User activity data
const userActivityData = {
  labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Logins',
      data: [23, 25, 28, 24, 26, 8, 4],
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    {
      label: 'Ações',
      data: [85, 92, 105, 87, 97, 42, 15],
      borderColor: 'rgba(249, 115, 22, 1)',
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
    },
  ],
};

// Mock data for recent projects
const recentProjects = [
  {
    id: '1',
    name: 'Edifício Residencial Aurora',
    company: 'Construtora Horizonte',
    date: '28/07/2023',
    status: 'completo' as const,
  },
  {
    id: '2',
    name: 'Centro Comercial Vitória',
    company: 'Incorporadora VitaPlus',
    date: '15/07/2023',
    status: 'completo' as const,
  },
  {
    id: '3',
    name: 'Condomínio Parque das Flores',
    company: 'Construtora Horizonte',
    date: '02/07/2023',
    status: 'completo' as const,
  },
  {
    id: '4',
    name: 'Galpão Industrial MultiTech',
    company: 'MultiTech Industries',
    date: '25/06/2023',
    status: 'completo' as const,
  },
  {
    id: '5',
    name: 'Edifício Corporativo Vision',
    company: 'Vision Enterprises',
    date: '18/06/2023',
    status: 'completo' as const,
  },
];

// Mock active users (for admin/superadmin view)
const activeUsers = [
  {
    id: '3',
    name: 'Usuário Comum',
    company: 'Empresa Principal',
    lastAction: 'Visualizou relatórios',
    time: '2 minutos atrás',
    status: 'active' as const,
  },
  {
    id: '4',
    name: 'Ana Silva',
    company: 'Empresa Principal',
    lastAction: 'Criou novo projeto',
    time: '15 minutos atrás',
    status: 'active' as const,
  },
  {
    id: '6',
    name: 'Mariana Costa',
    company: 'Empresa Principal',
    lastAction: 'Editou permissões',
    time: '47 minutos atrás',
    status: 'idle' as const,
  },
];

export default function Dashboard() {
  const { user, hasPermission } = useAuth();

  // Role-specific dashboards
  const renderSuperAdminDashboard = () => (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Empresas"
          value="5"
          subtitle="1 inativa"
          icon={<FiBriefcase size={24} />}
        />
        <StatCard
          title="Total de Usuários"
          value="23"
          subtitle="3 administradores"
          icon={<FiUsers size={24} />}
        />
        <StatCard
          title="Projetos no Sistema"
          value="74"
          subtitle="8 novos este mês"
          icon={<FiFileText size={24} />}
        />
        <StatCard
          title="Atividade"
          value="156"
          subtitle="ações nas últimas 24h"
          icon={<FiActivity size={24} />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Empresas e Projetos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <BarChart
                labels={companiesData.labels}
                datasets={companiesData.datasets}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Distribuição de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] flex items-center justify-center">
              <PieChart
                labels={clientDistributionData.labels}
                datasets={clientDistributionData.datasets}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Atividade dos Usuários</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <LineChart
                labels={userActivityData.labels}
                datasets={userActivityData.datasets}
              />
            </div>
          </CardContent>
        </Card>

        <ProjectList
          title="Usuários Ativos"
          projects={activeUsers.map(u => ({
            id: u.id,
            name: u.name,
            company: u.company,
            date: u.time,
            status: u.status === 'active' ? 'completo' : 'em_andamento',
          }))}
          viewAllLink="/dashboard/usuarios"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          href="/dashboard/empresas"
          title="Gerenciar Empresas"
          description="Adicionar ou editar empresas no sistema"
          icon={<FiBriefcase size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/usuarios"
          title="Gerenciar Usuários"
          description="Adicionar ou editar usuários"
          icon={<FiUserPlus size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/historico"
          title="Visualizar Atividades"
          description="Registro de todas as ações no sistema"
          icon={<FiActivity size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/configuracoes"
          title="Configurações do Sistema"
          description="Alterar configurações globais"
          icon={<FiSettings size={24} className="text-primary" />}
        />
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Projetos"
          value="42"
          subtitle="8 novos este mês"
          icon={<FiFileText size={24} />}
        />
        <StatCard
          title="Usuários da Empresa"
          value="6"
          subtitle="2 administradores"
          icon={<FiUsers size={24} />}
        />
        <StatCard
          title="Projetos no Mês"
          value="8"
          subtitle="+14% em relação ao mês anterior"
          icon={<FiClock size={24} />}
        />
        <StatCard
          title="Problemas Identificados"
          value="7"
          subtitle="3 críticos, 4 moderados"
          icon={<FiAlertTriangle size={24} />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Projetos por Mês</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <BarChart
                labels={monthlyProjectsData.labels}
                datasets={monthlyProjectsData.datasets}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Distribuição de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] flex items-center justify-center">
              <PieChart
                labels={clientDistributionData.labels}
                datasets={clientDistributionData.datasets}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Conformidade ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <LineChart
                labels={complianceData.labels}
                datasets={complianceData.datasets}
              />
            </div>
          </CardContent>
        </Card>

        <ProjectList
          title="Usuários Ativos"
          projects={activeUsers.map(u => ({
            id: u.id,
            name: u.name,
            company: u.company,
            date: u.time,
            status: u.status === 'active' ? 'completo' : 'em_andamento',
          }))}
          viewAllLink="/dashboard/usuarios"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          href="/dashboard/novo-projeto"
          title="Novo Projeto"
          description="Iniciar análise de um novo projeto estrutural"
          icon={<FiFileText size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/usuarios"
          title="Gerenciar Usuários"
          description="Adicionar ou editar usuários"
          icon={<FiUserPlus size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/historico"
          title="Histórico"
          description="Acessar histórico completo de projetos"
          icon={<FiClock size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/relatorios"
          title="Relatórios"
          description="Gerar relatórios personalizados"
          icon={<FiBarChart2 size={24} className="text-primary" />}
        />
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Meus Projetos"
          value="12"
          subtitle="3 novos este mês"
          icon={<FiFileText size={24} />}
        />
        <StatCard
          title="Clientes Ativos"
          value="8"
          subtitle="2 novos este mês"
          icon={<FiUsers size={24} />}
        />
        <StatCard
          title="Projetos no Mês"
          value="3"
          subtitle="+50% em relação ao mês anterior"
          icon={<FiClock size={24} />}
        />
        <StatCard
          title="Problemas Identificados"
          value="2"
          subtitle="1 crítico, 1 moderado"
          icon={<FiAlertTriangle size={24} />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Meus Projetos por Mês</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <BarChart
                labels={monthlyProjectsData.labels}
                datasets={[{
                  ...monthlyProjectsData.datasets[0],
                  data: [2, 1, 2, 3, 0, 0, 0]
                }]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Distribuição de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] flex items-center justify-center">
              <PieChart
                labels={clientDistributionData.labels}
                datasets={[{
                  ...clientDistributionData.datasets[0],
                  data: [5, 2, 1]
                }]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Conformidade ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px]">
              <LineChart
                labels={complianceData.labels}
                datasets={complianceData.datasets}
              />
            </div>
          </CardContent>
        </Card>

        <ProjectList
          title="Projetos Recentes"
          projects={recentProjects.slice(0, 5)}
          viewAllLink="/dashboard/historico"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          href="/dashboard/novo-projeto"
          title="Novo Projeto"
          description="Iniciar análise de um novo projeto estrutural"
          icon={<FiFileText size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/clientes"
          title="Gerenciar Clientes"
          description="Visualizar e editar informações de clientes"
          icon={<FiUsers size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/historico"
          title="Histórico"
          description="Acessar histórico completo de projetos"
          icon={<FiClock size={24} className="text-primary" />}
        />

        <ActionCard
          href="/dashboard/relatorios"
          title="Relatórios"
          description="Gerar relatórios personalizados"
          icon={<FiBarChart2 size={24} className="text-primary" />}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {user?.role === 'superadmin'
            ? 'Visão geral de todas as empresas, usuários e projetos do sistema.'
            : user?.role === 'admin'
              ? `Visão geral dos projetos, clientes e usuários da ${user?.company}.`
              : 'Visão geral dos seus projetos, clientes e atividades recentes.'}
        </p>
      </div>

      {user?.role === 'superadmin' && renderSuperAdminDashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'user' && renderUserDashboard()}
    </div>
  );
}
