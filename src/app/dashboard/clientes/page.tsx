"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiMapPin, FiMail, FiPhone, FiFileText, FiMoreVertical, FiPlus, FiSearch } from "react-icons/fi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Mock client data
const clients = [
  {
    id: "1",
    name: "Construtora Horizonte",
    address: "Av. Paulista, 1000, São Paulo, SP",
    email: "contato@horizonte.com.br",
    phone: "(11) 3456-7890",
    projects: 12,
    type: "Comercial",
    status: "ativo"
  },
  {
    id: "2",
    name: "Incorporadora VitaPlus",
    address: "Rua Augusta, 500, São Paulo, SP",
    email: "contato@vitaplus.com.br",
    phone: "(11) 2345-6789",
    projects: 8,
    type: "Comercial",
    status: "ativo"
  },
  {
    id: "3",
    name: "MultiTech Industries",
    address: "Rod. Anhanguera, km 110, Campinas, SP",
    email: "engenharia@multitech.com.br",
    phone: "(19) 3456-7890",
    projects: 5,
    type: "Industrial",
    status: "ativo"
  },
  {
    id: "4",
    name: "Vision Enterprises",
    address: "Av. Faria Lima, 2000, São Paulo, SP",
    email: "contato@vision.com.br",
    phone: "(11) 4567-8901",
    projects: 3,
    type: "Comercial",
    status: "ativo"
  },
  {
    id: "5",
    name: "Residencial Parque das Flores",
    address: "Rua das Acácias, 150, Jundiaí, SP",
    email: "sindico@parquedasflores.com.br",
    phone: "(11) 5678-9012",
    projects: 1,
    type: "Residencial",
    status: "ativo"
  },
  {
    id: "6",
    name: "Indústrias Mecânicas Precisão",
    address: "Distrito Industrial, Sorocaba, SP",
    email: "engenharia@precisao.ind.br",
    phone: "(15) 3456-7890",
    projects: 2,
    type: "Industrial",
    status: "inativo"
  }
];

export default function Clientes() {
  // Function to get the badge style based on client type
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Comercial':
        return 'bg-blue-100 text-blue-800';
      case 'Industrial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Residencial':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get the badge style based on client status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie informações de clientes e acompanhe seus projetos.</p>
        </div>
        <Button className="flex items-center gap-2">
          <FiPlus size={16} />
          <span>Novo Cliente</span>
        </Button>
      </div>

      <div className="w-full relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" size={16} />
        </div>
        <Input
          className="max-w-md pl-10"
          type="search"
          placeholder="Buscar clientes..."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {client.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold">{client.name}</h3>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FiMoreVertical size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="justify-start">Editar</Button>
                    <Button variant="ghost" size="sm" className="justify-start">Ver projetos</Button>
                    <Button variant="ghost" size="sm" className="justify-start text-red-600">Excluir</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <FiMapPin className="text-gray-500 mt-1 flex-shrink-0" size={14} />
                <p className="text-sm text-gray-700">{client.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-gray-500" size={14} />
                <p className="text-sm text-gray-700">{client.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-gray-500" size={14} />
                <p className="text-sm text-gray-700">{client.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <FiFileText className="text-gray-500" size={14} />
                <p className="text-sm text-gray-700">{client.projects} projetos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTypeBadgeClass(client.type)}>
                {client.type}
              </Badge>
              <Badge variant="outline" className={getStatusBadgeClass(client.status)}>
                {client.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
