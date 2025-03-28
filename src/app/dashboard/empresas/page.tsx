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
  FiEye,
  FiHome,
  FiMapPin
} from "react-icons/fi";
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interfaces para subempresas/filiais
interface BranchOffice {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  companyId: string;
  userCount: number;
  projectCount: number;
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  userCount: number;
  projectCount: number;
  branches: BranchOffice[];
}

// Mock companies data with a few branches
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Empresa Principal",
    email: "contato@empresaprincipal.com",
    phone: "(11) 5555-1234",
    address: "Av. Paulista, 1000, São Paulo, SP",
    active: true,
    userCount: 6,
    projectCount: 42,
    branches: [
      {
        id: "1",
        name: "Matriz",
        email: "matriz@empresaprincipal.com",
        phone: "(11) 5555-1234",
        address: "Av. Paulista, 1000, São Paulo, SP",
        active: true,
        companyId: "1",
        userCount: 3,
        projectCount: 20
      },
      {
        id: "2",
        name: "Filial São Paulo",
        email: "sp@empresaprincipal.com",
        phone: "(11) 5555-5678",
        address: "Av. Brigadeiro Faria Lima, 2000, São Paulo, SP",
        active: true,
        companyId: "1",
        userCount: 2,
        projectCount: 15
      }
    ]
  },
  {
    id: "2",
    name: "Construtora Horizonte",
    email: "contato@horizonte.com.br",
    phone: "(11) 3456-7890",
    address: "Av. Paulista, 1000, São Paulo, SP",
    active: true,
    userCount: 8,
    projectCount: 12,
    branches: [
      {
        id: "3",
        name: "Matriz",
        email: "matriz@horizonte.com.br",
        phone: "(11) 3456-7890",
        address: "Av. Paulista, 1000, São Paulo, SP",
        active: true,
        companyId: "2",
        userCount: 5,
        projectCount: 8
      }
    ]
  }
];

export default function EmpresasPage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("empresas");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter companies based on search term
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all branches from all companies
  const allBranches = companies.flatMap(company =>
    company.branches.map(branch => ({
      ...branch,
      companyName: company.name
    }))
  );

  // Filter branches based on search term
  const filteredBranches = allBranches.filter(
    (branch: any) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle company activation/deactivation
  const toggleCompanyStatus = (companyId: string) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((company) =>
        company.id === companyId ? { ...company, active: !company.active } : company
      )
    );
    showSuccess(`Status da empresa alterado com sucesso!`);
  };

  // Delete company
  const handleDeleteCompany = () => {
    if (selectedCompany) {
      setCompanies((prevCompanies) => prevCompanies.filter((company) => company.id !== selectedCompany.id));
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      showSuccess(`Empresa excluída com sucesso!`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas e Filiais</h1>
          <p className="text-muted-foreground">Gerencie as empresas e filiais cadastradas no sistema</p>
        </div>

        {hasPermission('create:company') && (
          <Button className="flex items-center gap-2">
            <FiPlus size={16} />
            <span>Nova Empresa</span>
          </Button>
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

      <Tabs defaultValue="empresas" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="empresas" className="flex items-center gap-2">
            <FiHome size={16} />
            <span>Empresas</span>
          </TabsTrigger>
          <TabsTrigger value="filiais" className="flex items-center gap-2">
            <FiMapPin size={16} />
            <span>Filiais</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresas" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative w-full mb-6">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={16} />
                </div>
                <Input
                  className="pl-10"
                  type="search"
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Filiais</TableHead>
                      <TableHead>Usuários</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={company.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {company.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell>{company.branches.length}</TableCell>
                        <TableCell>{company.userCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Ver detalhes"
                            >
                              <FiEye className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>

                            {hasPermission('edit:company') && (
                              <Button
                                variant={company.active ? 'destructive' : 'outline'}
                                size="sm"
                                className={`h-8 w-8 p-0`}
                                onClick={() => toggleCompanyStatus(company.id)}
                                title={company.active ? 'Desativar' : 'Ativar'}
                              >
                                {company.active ? (
                                  <FiX className="h-4 w-4" />
                                ) : (
                                  <FiCheck className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {company.active ? 'Desativar' : 'Ativar'}
                                </span>
                              </Button>
                            )}

                            {hasPermission('delete:company') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setIsDeleteDialogOpen(true);
                                }}
                                title="Excluir"
                              >
                                <FiTrash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredCompanies.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma empresa encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filiais" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative w-full mb-6">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={16} />
                </div>
                <Input
                  className="pl-10"
                  type="search"
                  placeholder="Buscar filiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Nome da Filial</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch: any) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.companyName}</TableCell>
                        <TableCell>{branch.email}</TableCell>
                        <TableCell>{branch.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={branch.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {branch.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Ver detalhes"
                            >
                              <FiEye className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredBranches.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Nenhuma filial encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              Tem certeza que deseja excluir a empresa{" "}
              <strong>{selectedCompany?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta ação excluirá todos os dados da empresa, incluindo filiais, usuários e projetos. Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
