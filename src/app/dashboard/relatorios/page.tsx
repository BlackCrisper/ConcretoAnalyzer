"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FiDownload, FiFileText, FiPieChart, FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { BarChart } from '@/components/dashboard/bar-chart';
import { LineChart } from '@/components/dashboard/line-chart';
import { PieChart } from '@/components/dashboard/pie-chart';

// Mock chart data
const projectsByMonthData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Projetos',
      data: [4, 3, 5, 7, 6, 8, 9, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
    },
  ],
};

const projectsByTypeData = {
  labels: ['Residencial', 'Comercial', 'Industrial'],
  datasets: [
    {
      label: 'Projetos',
      data: [28, 18, 12],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(249, 168, 37, 0.7)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(249, 168, 37, 1)',
      ],
    },
  ],
};

const complianceByMonthData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Taxa de Conformidade (%)',
      data: [75, 62, 68, 85, 90, 82, 88],
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
  ],
};

// Mock report templates
const reportTemplates = [
  {
    id: "1",
    name: "Relatório Mensal de Projetos",
    description: "Resumo de todos os projetos concluídos e em andamento no mês",
    type: "Mensal",
    format: "PDF"
  },
  {
    id: "2",
    name: "Análise de Conformidade",
    description: "Detalhes sobre conformidade de projetos e tendências",
    type: "Trimestral",
    format: "PDF/Excel"
  },
  {
    id: "3",
    name: "Desempenho por Cliente",
    description: "Análise de projetos por cliente com métricas de desempenho",
    type: "Sob Demanda",
    format: "PDF"
  },
  {
    id: "4",
    name: "Relatório Financeiro",
    description: "Resumo financeiro de projetos, custos e receitas",
    type: "Mensal",
    format: "Excel"
  },
  {
    id: "5",
    name: "Histórico Completo",
    description: "Listagem detalhada de todos os projetos concluídos",
    type: "Anual",
    format: "PDF/Excel"
  },
  {
    id: "6",
    name: "Análise de Problemas Estruturais",
    description: "Detalhamento de problemas estruturais identificados",
    type: "Sob Demanda",
    format: "PDF"
  },
];

export default function Relatorios() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedType, setSelectedType] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => (currentYear - i).toString());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios personalizados sobre projetos e análises estruturais.</p>
      </div>

      <Tabs defaultValue="predefinidos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefinidos">Relatórios Predefinidos</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos e Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="predefinidos" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input type="search" placeholder="Buscar relatórios..." />
            </div>
            <div className="flex gap-4">
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Anual">Anual</option>
                <option value="Sob Demanda">Sob Demanda</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FiFileText size={18} className="text-primary" />
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {template.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.format}</Badge>
                    <Button size="sm" className="gap-2">
                      <FiDownload size={14} />
                      <span>Gerar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="graficos" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Todos os meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>

            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBarChart2 size={18} className="text-primary" />
                  <CardTitle>Projetos por Mês</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <FiDownload size={14} />
                  <span>Exportar</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart
                    labels={projectsByMonthData.labels}
                    datasets={projectsByMonthData.datasets}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiPieChart size={18} className="text-primary" />
                  <CardTitle>Projetos por Tipo</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <FiDownload size={14} />
                  <span>Exportar</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart
                    labels={projectsByTypeData.labels}
                    datasets={projectsByTypeData.datasets}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingUp size={18} className="text-primary" />
                  <CardTitle>Taxa de Conformidade ao Longo do Tempo</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <FiDownload size={14} />
                  <span>Exportar</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChart
                    labels={complianceByMonthData.labels}
                    datasets={complianceByMonthData.datasets}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
