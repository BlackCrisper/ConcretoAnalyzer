"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta.</p>
      </div>

      <Tabs defaultValue="conta" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="conta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" defaultValue="Antônio Carlos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="antoniocarlosres121@gmail.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" defaultValue="Engenheiro Estrutural" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crea">Número do CREA</Label>
                <Input id="crea" defaultValue="CREA-SP 12345" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  className="min-h-[100px]"
                  defaultValue="Engenheiro estrutural com mais de 10 anos de experiência em projetos residenciais, comerciais e industriais."
                />
              </div>

              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <select
                  id="language"
                  defaultValue="pt_BR"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pt_BR">Português (Brasil)</option>
                  <option value="en_US">English (United States)</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <select
                  id="timezone"
                  defaultValue="America/Sao_Paulo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_format">Formato de Data</Label>
                <select
                  id="date_format"
                  defaultValue="DD/MM/YYYY"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button>Salvar Preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email</h3>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resumo Semanal</p>
                    <p className="text-sm text-muted-foreground">Receba um resumo semanal de projetos e atividades</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos Projetos</p>
                    <p className="text-sm text-muted-foreground">Notificações quando novos projetos forem criados</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações de Projetos</p>
                    <p className="text-sm text-muted-foreground">Notificações sobre mudanças e atualizações em projetos</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatórios</p>
                    <p className="text-sm text-muted-foreground">Receba relatórios periódicos por email</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sistema</h3>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações no Sistema</p>
                    <p className="text-sm text-muted-foreground">Exibir notificações dentro do sistema</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sons de Notificação</p>
                    <p className="text-sm text-muted-foreground">Reproduzir sons para notificações importantes</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Salvar Preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <div className="flex justify-end">
                <Button>Alterar Senha</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outras Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sessões Ativas</p>
                  <p className="text-sm text-muted-foreground">Gerencie os dispositivos conectados à sua conta</p>
                </div>
                <Button variant="outline">Gerenciar</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Log de Atividades</p>
                  <p className="text-sm text-muted-foreground">Visualize o histórico de atividades da sua conta</p>
                </div>
                <Button variant="outline">Visualizar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
