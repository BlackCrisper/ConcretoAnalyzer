"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock projects data
const projects = [
  {
    id: "1",
    name: "Edifício Residencial Aurora",
    client: "Construtora Horizonte",
    type: "Residencial",
    status: "completo",
    startDate: "15/05/2023",
    endDate: "28/07/2023",
    engineer: "João Silva"
  },
  {
    id: "2",
    name: "Centro Comercial Vitória",
    client: "Incorporadora VitaPlus",
    type: "Comercial",
    status: "completo",
    startDate: "01/06/2023",
    endDate: "15/07/2023",
    engineer: "Maria Oliveira"
  },
  {
    id: "3",
    name: "Condomínio Parque das Flores",
    client: "Construtora Horizonte",
    type: "Residencial",
    status: "completo",
    startDate: "15/05/2023",
    endDate: "02/07/2023",
    engineer: "Carlos Santos"
  },
  {
    id: "4",
    name: "Galpão Industrial MultiTech",
    client: "MultiTech Industries",
    type: "Industrial",
    status: "completo",
    startDate: "15/04/2023",
    endDate: "25/06/2023",
    engineer: "João Silva"
  },
  {
    id: "5",
    name: "Edifício Corporativo Vision",
    client: "Vision Enterprises",
    type: "Comercial",
    status: "completo",
    startDate: "01/04/2023",
    endDate: "18/06/2023",
    engineer: "Carlos Santos"
  },
  {
    id: "6",
    name: "Complexo Residencial Jardins",
    client: "Construtora Horizonte",
    type: "Residencial",
    status: "em_andamento",
    startDate: "01/07/2023",
    endDate: "-",
    engineer: "Maria Oliveira"
  },
  {
    id: "7",
    name: "Shopping Center Metrópole",
    client: "Incorporadora VitaPlus",
    type: "Comercial",
    status: "em_andamento",
    startDate: "15/07/2023",
    endDate: "-",
    engineer: "João Silva"
  },
  {
    id: "8",
    name: "Fábrica de Componentes Eletrônicos",
    client: "MultiTech Industries",
    type: "Industrial",
    status: "pausado",
    startDate: "01/06/2023",
    endDate: "-",
    engineer: "Carlos Santos"
  }
];

export default function Historico() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Function to get the badge style based on project status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completo':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get the status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completo':
        return 'Completo';
      case 'em_andamento':
        return 'Em andamento';
      case 'pausado':
        return 'Pausado';
      default:
        return status;
    }
  };

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "" || project.type === filterType;
    const matchesStatus = filterStatus === "" || project.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">Acessar histórico completo de projetos de análise estrutural.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Buscar por nome ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Industrial">Industrial</option>
              </select>

              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="completo">Completo</option>
                <option value="em_andamento">Em andamento</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nome do Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Engenheiro</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Conclusão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>{project.engineer}</TableCell>
                    <TableCell>{project.startDate}</TableCell>
                    <TableCell>{project.endDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum projeto encontrado com os critérios especificados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
