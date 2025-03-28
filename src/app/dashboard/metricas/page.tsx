"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from '@/components/dashboard/bar-chart';
import { LineChart } from '@/components/dashboard/line-chart';
import { PieChart } from '@/components/dashboard/pie-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { useAuth } from '@/contexts/auth-context';
import {
  FiDownload,
  FiFilter,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiHome,
  FiMapPin,
  FiRefreshCw,
  FiCalendar
} from "react-icons/fi";

// Mock data for branches
const mockBranches = [
  { id: "1", name: "Matriz", companyId: "1", companyName: "Empresa Principal" },
  { id: "2", name: "Filial São Paulo", companyId: "1", companyName: "Empresa Principal" },
  { id: "3", name: "Filial Rio", companyId: "1", companyName: "Empresa Principal" },
  { id: "4", name: "Matriz", companyId: "2", companyName: "Construtora Horizonte" },
  { id: "5", name: "Filial Campinas", companyId: "2", companyName: "Construtora Horizonte" },
];

// Mock KPI data by branch
const branchKpiData = {
  "1": { // Matriz - Empresa Principal
    projects: 20,
    users: 3,
    clients: 8,
    issues: 1,
    projectsLastMonth: 3,
    activeUsers: 3,
    monthlyData: [12, 14, 15, 17, 20, 18, 20],
    clientTypes: [5, 2, 1],
    projectStatus: [13, 4, 3]
  },
  "2": { // Filial São Paulo - Empresa Principal
    projects: 15,
    users: 2,
    clients: 6,
    issues: 2,
    projectsLastMonth: 4,
    activeUsers: 2,
    monthlyData: [6, 8, 9, 10, 12, 13, 15],
    clientTypes: [3, 2, 1],
    projectStatus: [9, 4, 2]
  },
  "3": { // Filial Rio - Empresa Principal
    projects: 7,
    users: 1,
    clients: 4,
    issues: 0,
    projectsLastMonth: 1,
    activeUsers: 1,
    monthlyData: [2, 3, 3, 4, 5, 6, 7],
    clientTypes: [3, 1, 0],
    projectStatus: [5, 2, 0]
  },
  "4": { // Matriz - Construtora Horizonte
    projects: 8,
    users: 5,
    clients: 4,
    issues: 3,
    projectsLastMonth: 1,
    activeUsers: 4,
    monthlyData: [4, 5, 5, 6, 7, 7, 8],
    clientTypes: [2, 1, 1],
    projectStatus: [5, 2, 1]
  },
  "5": { // Filial Campinas - Construtora Horizonte
    projects: 4,
    users: 3,
    clients: 2,
    issues: 1,
    projectsLastMonth: 1,
    activeUsers: 2,
    monthlyData: [1, 1, 2, 2, 3, 3, 4],
    clientTypes: [1, 1, 0],
    projectStatus: [2, 1, 1]
  }
};

// Mock KPI data by company
const companyKpiData = {
  "1": { // Empresa Principal
    projects: 42,
    users: 6,
    clients: 18,
    issues: 3,
    projectsLastMonth: 8,
    activeUsers: 6,
    monthlyData: [20, 25, 27, 31, 37, 37, 42],
    clientTypes: [11, 5, 2],
    projectStatus: [27, 10, 5]
  },
  "2": { // Construtora Horizonte
    projects: 12,
    users: 8,
    clients: 6,
    issues: 4,
    projectsLastMonth: 2,
    activeUsers: 6,
    monthlyData: [5, 6, 7, 8, 10, 10, 12],
    clientTypes: [3, 2, 1],
    projectStatus: [7, 3, 2]
  }
};

export default function Metricas() {
  const { user, hasPermission } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  // States for filters
  const [selectedPeriod, setSelectedPeriod] = useState('lastSixMonths');
  const [selectedCompanyId, setSelectedCompanyId] = useState(isSuperAdmin ? "1" : user?.companyId || "1");
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [activeTab, setActiveTab] = useState('visaoGeral');

  // Filter branches by selected company
  const filteredBranches = mockBranches.filter(branch =>
    branch.companyId === selectedCompanyId
  );

  // Get the appropriate data based on selection
  const getDataForCurrentView = () => {
    if (selectedBranchId === "all") {
      return companyKpiData[selectedCompanyId];
    } else {
      return branchKpiData[selectedBranchId];
    }
  };

  const currentData = getDataForCurrentView();

  // Chart data setup
  const projectsTrendData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Projetos',
        data: currentData.monthlyData,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
      },
    ],
  };

  const clientTypesData = {
    labels: ['Residencial', 'Comercial', 'Industrial'],
    datasets: [
      {
        label: 'Clientes',
        data: currentData.clientTypes,
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Green
          'rgba(59, 130, 246, 0.7)', // Blue
          'rgba(249, 168, 37, 0.7)', // Yellow
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(249, 168, 37, 1)',
        ],
      },
    ],
  };

  const projectStatusData = {
    labels: ['Concluído', 'Em Progresso', 'Com Problemas'],
    datasets: [
      {
        label: 'Status',
        data: currentData.projectStatus,
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Green
          'rgba(59, 130, 246, 0.7)', // Blue
          'rgba(244, 63, 94, 0.7)', // Red
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(244, 63, 94, 1)',
        ],
      },
    ],
  };

  // Calculate growth percentage from previous month
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return "+100%";
    const growth = ((current - previous) / previous) * 100;
    return growth >= 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Métricas e KPIs</h1>
          <p className="text-muted-foreground">
            Acompanhe os principais indicadores de desempenho por empresa e filial
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FiDownload size={16} />
            <span>Exportar Dados</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FiRefreshCw size={16} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {isSuperAdmin && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Empresa</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    setSelectedBranchId("all"); // Reset branch selection when company changes
                  }}
                >
                  <option value="1">Empresa Principal</option>
                  <option value="2">Construtora Horizonte</option>
                </select>
              </div>
            )}

            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filial</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                <option value="all">Todas as Filiais</option>
                {filteredBranches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Período</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="lastMonth">Último Mês</option>
                <option value="lastThreeMonths">Últimos 3 Meses</option>
                <option value="lastSixMonths">Últimos 6 Meses</option>
                <option value="lastYear">Último Ano</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="visaoGeral" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visaoGeral" className="flex items-center gap-2">
            <FiBarChart2 size={16} />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="projetos" className="flex items-center gap-2">
            <FiFileText size={16} />
            <span>Projetos</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <FiUsers size={16} />
            <span>Usuários</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral Tab */}
        <TabsContent value="visaoGeral" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total de Projetos"
              value={currentData.projects.toString()}
              subtitle={`${currentData.projectsLastMonth} novos este mês`}
              icon={<FiFileText size={24} />}
            />
            <StatCard
              title={selectedBranchId === "all" ? "Usuários Ativos" : "Usuários na Filial"}
              value={currentData.users.toString()}
              subtitle={`${currentData.activeUsers} ativos hoje`}
              icon={<FiUsers size={24} />}
            />
            <StatCard
              title="Clientes"
              value={currentData.clients.toString()}
              subtitle="Total de clientes atendidos"
              icon={<FiHome size={24} />}
            />
            <StatCard
              title="Problemas Estruturais"
              value={currentData.issues.toString()}
              subtitle="Identificados na análise"
              icon={<FiAlertTriangle size={24} />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingUp size={18} className="text-primary" />
                  <CardTitle>Evolução de Projetos</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <FiDownload size={14} />
                  <span>Exportar</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart
                    labels={projectsTrendData.labels}
                    datasets={projectsTrendData.datasets}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiPieChart size={18} className="text-primary" />
                  <CardTitle>Tipos de Cliente</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <FiDownload size={14} />
                  <span>Exportar</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart
                    labels={clientTypesData.labels}
                    datasets={clientTypesData.datasets}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FiPieChart size={18} className="text-primary" />
                <CardTitle>Status dos Projetos</CardTitle>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <FiDownload size={14} />
                <span>Exportar</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart
                    labels={projectStatusData.labels}
                    datasets={projectStatusData.datasets}
                  />
                </div>
                <div className="flex flex-col justify-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Análise de Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((projectStatusData.datasets[0].data[0] / currentData.projects) * 100)}% dos projetos foram concluídos com sucesso.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((projectStatusData.datasets[0].data[2] / currentData.projects) * 100)}% dos projetos apresentam problemas estruturais que necessitam atenção.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Ver Detalhes de Projetos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projetos Tab */}
        <TabsContent value="projetos" className="space-y-6">
          {/* Projetos Content */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Projetos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Visão Geral</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Projetos Concluídos</span>
                        <span className="font-medium">{projectStatusData.datasets[0].data[0]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(projectStatusData.datasets[0].data[0] / currentData.projects) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Em Progresso</span>
                        <span className="font-medium">{projectStatusData.datasets[0].data[1]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(projectStatusData.datasets[0].data[1] / currentData.projects) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Com Problemas</span>
                        <span className="font-medium">{projectStatusData.datasets[0].data[2]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(projectStatusData.datasets[0].data[2] / currentData.projects) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Tipo de Projetos</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Residencial</span>
                        <span className="font-medium">{clientTypesData.datasets[0].data[0]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(clientTypesData.datasets[0].data[0] / currentData.clients) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Comercial</span>
                        <span className="font-medium">{clientTypesData.datasets[0].data[1]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(clientTypesData.datasets[0].data[1] / currentData.clients) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Industrial</span>
                        <span className="font-medium">{clientTypesData.datasets[0].data[2]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(clientTypesData.datasets[0].data[2] / currentData.clients) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h4 className="text-sm text-green-700">Tempo Médio de Conclusão</h4>
                      <p className="text-2xl font-bold text-green-800">14 dias</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-sm text-blue-700">Taxa de Aprovação</h4>
                      <p className="text-2xl font-bold text-blue-800">92%</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <h4 className="text-sm text-yellow-700">Revisões Médias</h4>
                      <p className="text-2xl font-bold text-yellow-800">1.4</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <h4 className="text-sm text-purple-700">Satisfação do Cliente</h4>
                      <p className="text-2xl font-bold text-purple-800">4.8/5</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuários Tab */}
        <TabsContent value="usuarios" className="space-y-6">
          {/* Usuários Content */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Usuários Ativos</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                      <div>
                        <p className="text-sm text-green-700">Hoje</p>
                        <p className="text-2xl font-bold text-green-800">{currentData.activeUsers}</p>
                      </div>
                      <FiUsers className="h-10 w-10 text-green-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-sm text-blue-700">Esta Semana</p>
                        <p className="text-2xl font-bold text-blue-800">{currentData.users}</p>
                      </div>
                      <FiUsers className="h-10 w-10 text-blue-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div>
                        <p className="text-sm text-purple-700">Total de Usuários</p>
                        <p className="text-2xl font-bold text-purple-800">{currentData.users}</p>
                      </div>
                      <FiUsers className="h-10 w-10 text-purple-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-4">Ações por Usuário</h3>
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuário
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Projetos
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completados
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Usuário 1
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            8
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            5
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Usuário 2
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            6
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            4
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Usuário 3
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            4
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            3
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Ver Todos os Usuários
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
