"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/auth-context';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  FiDownload,
  FiFileText,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiPlus,
  FiSave,
  FiShare2,
  FiCalendar,
  FiClock,
  FiCheck,
  FiZap,
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiSearch
} from "react-icons/fi";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// Template types and interfaces
interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'graph' | 'table';
  description: string;
  userTypes: ('admin' | 'user' | 'superadmin')[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[]; // IDs of fields
  userTypes: ('admin' | 'user' | 'superadmin')[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  createdBy: string;
}

interface SavedReport {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  parameters: Record<string, any>;
  isFavorite: boolean;
  userTypes: ('admin' | 'user' | 'superadmin')[];
}

// Mock available fields for reports
const availableFields: ReportField[] = [
  {
    id: 'field_project_count',
    name: 'Total de Projetos',
    type: 'number',
    description: 'Número total de projetos no período',
    userTypes: ['user', 'admin', 'superadmin']
  },
  {
    id: 'field_project_by_status',
    name: 'Projetos por Status',
    type: 'graph',
    description: 'Gráfico de pizza mostrando distribuição de projetos por status',
    userTypes: ['admin', 'superadmin']
  },
  {
    id: 'field_monthly_projects',
    name: 'Projetos por Mês',
    type: 'graph',
    description: 'Gráfico de barras mostrando projetos criados por mês',
    userTypes: ['user', 'admin', 'superadmin']
  },
  {
    id: 'field_client_distribution',
    name: 'Distribuição de Clientes',
    type: 'graph',
    description: 'Gráfico de pizza mostrando distribuição de clientes por tipo',
    userTypes: ['admin', 'superadmin']
  },
  {
    id: 'field_structural_issues',
    name: 'Problemas Estruturais',
    type: 'table',
    description: 'Tabela listando problemas estruturais identificados',
    userTypes: ['user', 'admin', 'superadmin']
  },
  {
    id: 'field_compliance_rate',
    name: 'Taxa de Conformidade',
    type: 'number',
    description: 'Percentual de projetos em conformidade com as normas técnicas',
    userTypes: ['admin', 'superadmin']
  },
  {
    id: 'field_safety_factors',
    name: 'Fatores de Segurança',
    type: 'table',
    description: 'Tabela com fatores de segurança por elemento estrutural',
    userTypes: ['user', 'admin', 'superadmin']
  },
  {
    id: 'field_user_activity',
    name: 'Atividade de Usuários',
    type: 'graph',
    description: 'Gráfico de linhas mostrando atividade de usuários ao longo do tempo',
    userTypes: ['admin', 'superadmin']
  },
  {
    id: 'field_company_branches',
    name: 'Filiais da Empresa',
    type: 'table',
    description: 'Tabela com dados das filiais da empresa',
    userTypes: ['admin', 'superadmin']
  },
  {
    id: 'field_project_timeline',
    name: 'Linha do Tempo de Projetos',
    type: 'graph',
    description: 'Gráfico de Gantt mostrando cronograma de projetos',
    userTypes: ['user', 'admin', 'superadmin']
  }
];

// Mock report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: 'template_monthly_summary',
    name: 'Resumo Mensal',
    description: 'Relatório resumido de atividades e projetos do mês',
    category: 'Geral',
    fields: ['field_project_count', 'field_monthly_projects', 'field_structural_issues'],
    userTypes: ['user', 'admin', 'superadmin'],
    createdAt: '2023-06-01',
    updatedAt: '2023-06-10',
    isPublic: true,
    createdBy: 'system'
  },
  {
    id: 'template_admin_overview',
    name: 'Visão Geral Administrativa',
    description: 'Relatório completo com todas as métricas para administradores',
    category: 'Administração',
    fields: ['field_project_count', 'field_project_by_status', 'field_client_distribution', 'field_compliance_rate', 'field_user_activity'],
    userTypes: ['admin', 'superadmin'],
    createdAt: '2023-06-02',
    updatedAt: '2023-06-20',
    isPublic: true,
    createdBy: 'system'
  },
  {
    id: 'template_structural_analysis',
    name: 'Análise Estrutural',
    description: 'Relatório técnico com análise detalhada de estruturas',
    category: 'Técnico',
    fields: ['field_structural_issues', 'field_safety_factors', 'field_compliance_rate'],
    userTypes: ['user', 'admin', 'superadmin'],
    createdAt: '2023-06-03',
    updatedAt: '2023-06-15',
    isPublic: true,
    createdBy: 'system'
  },
  {
    id: 'template_branch_performance',
    name: 'Desempenho de Filiais',
    description: 'Comparativo de desempenho entre filiais da empresa',
    category: 'Administração',
    fields: ['field_company_branches', 'field_project_count', 'field_client_distribution'],
    userTypes: ['admin', 'superadmin'],
    createdAt: '2023-06-04',
    updatedAt: '2023-06-12',
    isPublic: true,
    createdBy: 'system'
  }
];

// Mock saved reports
const savedReports: SavedReport[] = [
  {
    id: 'report_1',
    name: 'Resumo Junho 2023',
    templateId: 'template_monthly_summary',
    templateName: 'Resumo Mensal',
    createdAt: '2023-06-15',
    updatedAt: '2023-06-15',
    createdBy: 'user1',
    parameters: {
      startDate: '2023-06-01',
      endDate: '2023-06-30'
    },
    isFavorite: true,
    userTypes: ['user', 'admin', 'superadmin']
  },
  {
    id: 'report_2',
    name: 'Análise Estrutural - Projeto Aurora',
    templateId: 'template_structural_analysis',
    templateName: 'Análise Estrutural',
    createdAt: '2023-06-20',
    updatedAt: '2023-06-22',
    createdBy: 'user1',
    parameters: {
      projectId: 'project_1',
      includeGraphs: true
    },
    isFavorite: false,
    userTypes: ['user', 'admin', 'superadmin']
  },
  {
    id: 'report_3',
    name: 'Desempenho Administradores Q2',
    templateId: 'template_admin_overview',
    templateName: 'Visão Geral Administrativa',
    createdAt: '2023-06-25',
    updatedAt: '2023-06-25',
    createdBy: 'admin1',
    parameters: {
      startDate: '2023-04-01',
      endDate: '2023-06-30',
      includeInactive: false
    },
    isFavorite: true,
    userTypes: ['admin', 'superadmin']
  },
  {
    id: 'report_4',
    name: 'Comparativo Filiais 2023',
    templateId: 'template_branch_performance',
    templateName: 'Desempenho de Filiais',
    createdAt: '2023-06-30',
    updatedAt: '2023-06-30',
    createdBy: 'admin1',
    parameters: {
      year: '2023',
      includeClosed: false
    },
    isFavorite: false,
    userTypes: ['admin', 'superadmin']
  }
];

// Function to filter fields based on user role
const filterFieldsByUserRole = (fields: ReportField[], role: string) => {
  return fields.filter(field => field.userTypes.includes(role as any));
};

// Function to filter templates based on user role
const filterTemplatesByUserRole = (templates: ReportTemplate[], role: string) => {
  return templates.filter(template => template.userTypes.includes(role as any));
};

// Function to filter saved reports based on user role
const filterReportsByUserRole = (reports: SavedReport[], role: string) => {
  return reports.filter(report => report.userTypes.includes(role as any));
};

export default function RelatoriosPersonalizados() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('meus-relatorios');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Filter reports based on user role and search term
  const userRole = user?.role || 'user';

  const filteredTemplates = filterTemplatesByUserRole(reportTemplates, userRole)
    .filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredReports = filterReportsByUserRole(savedReports, userRole)
    .filter(report =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.templateName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredFields = filterFieldsByUserRole(availableFields, userRole)
    .filter(field =>
      !searchTerm ||
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle template selection
  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSelectedFields(template.fields);
    setNewReportName(`${template.name} - ${new Date().toLocaleDateString()}`);
  };

  // Handle report creation
  const handleCreateReport = () => {
    // In a real app, this would call an API to save the report
    console.log('Creating report:', {
      name: newReportName,
      templateId: selectedTemplate?.id,
      fields: selectedFields,
      dateRange
    });
    setIsCreateDialogOpen(false);
    setSelectedTemplate(null);
    setSelectedFields([]);
    setNewReportName('');
  };

  // Toggle field selection
  const toggleFieldSelection = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Personalizados</h1>
          <p className="text-muted-foreground">
            Crie, salve e compartilhe relatórios personalizados baseados em modelos
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <FiPlus size={16} />
                <span>Novo Relatório</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Relatório Personalizado</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Nome do Relatório</Label>
                  <Input
                    id="reportName"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                    placeholder="Ex: Relatório Mensal - Junho 2023"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Campos do Relatório</Label>
                  <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    <div className="space-y-2">
                      {filteredFields.map((field) => (
                        <div key={field.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={field.id}
                            checked={selectedFields.includes(field.id)}
                            onCheckedChange={() => toggleFieldSelection(field.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={field.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {field.name}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {field.description}
                            </p>
                          </div>
                        </div>
                      ))}

                      {filteredFields.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          Nenhum campo disponível para o seu perfil.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateReport}
                  disabled={!newReportName || selectedFields.length === 0}
                >
                  Criar Relatório
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" size={16} />
          </div>
          <Input
            className="pl-10"
            type="search"
            placeholder="Buscar relatórios e modelos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="meus-relatorios" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meus-relatorios" className="flex items-center gap-1">
            <FiFileText size={16} />
            <span>Meus Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="modelos" className="flex items-center gap-1">
            <FiZap size={16} />
            <span>Modelos de Relatório</span>
          </TabsTrigger>
          <TabsTrigger value="campos" className="flex items-center gap-1">
            <FiBarChart2 size={16} />
            <span>Campos Disponíveis</span>
          </TabsTrigger>
        </TabsList>

        {/* Meus Relatórios Tab */}
        <TabsContent value="meus-relatorios" className="space-y-6">
          {filteredReports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FiFileText size={18} className="text-primary" />
                        <CardTitle className="text-xl">{report.name}</CardTitle>
                      </div>
                      {report.isFavorite && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Favorito
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baseado em: {report.templateName}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <FiCalendar className="mr-2 text-muted-foreground" size={14} />
                        <span className="text-muted-foreground">Criado em: {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiClock className="mr-2 text-muted-foreground" size={14} />
                        <span className="text-muted-foreground">Última atualização: {new Date(report.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="outline" className="gap-1">
                        <FiEdit size={14} />
                        <span>Editar</span>
                      </Button>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Compartilhar">
                          <FiShare2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="default" className="h-8 w-8 p-0" title="Baixar">
                          <FiDownload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FiFileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum relatório encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comece criando um novo relatório baseado em um dos nossos modelos.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setActiveTab('modelos');
                }}
              >
                Ver Modelos de Relatório
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Modelos de Relatório Tab */}
        <TabsContent value="modelos" className="space-y-6">
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FiZap size={18} className="text-primary" />
                        <CardTitle className="text-xl">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Campos incluídos:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.fields.map((fieldId) => {
                          const field = availableFields.find(f => f.id === fieldId);
                          return field ? (
                            <Badge key={fieldId} variant="outline">
                              {field.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleSelectTemplate(template);
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      Usar este Modelo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FiZap className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum modelo encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Não há modelos de relatório disponíveis para o seu perfil de usuário.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Campos Disponíveis Tab */}
        <TabsContent value="campos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campos Disponíveis para Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFields.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Campo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Disponibilidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">{field.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {field.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{field.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                field.userTypes.includes('user')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {field.userTypes.includes('user')
                                ? 'Todos'
                                : field.userTypes.includes('admin')
                                  ? 'Admin+'
                                  : 'SuperAdmin'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum campo encontrado para o seu perfil de usuário.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Sobre Campos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-blue-50 text-blue-800 flex items-start">
                  <FiAlertTriangle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Campos e Permissões</h3>
                    <p className="text-sm">
                      Os campos disponíveis para seus relatórios dependem do seu nível de acesso no sistema.
                      Administradores têm acesso a mais campos analíticos e comparativos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <FiPieChart className="text-primary" />
                      <span>Campos de Gráficos</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Permitem visualizar dados em formato de gráficos de pizza, barras ou linhas. Úteis para análise de tendências e comparações.
                    </p>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <FiFileText className="text-primary" />
                      <span>Campos de Tabelas</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Mostram dados detalhados em formato tabular, permitindo análise aprofundada de informações específicas.
                    </p>
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
