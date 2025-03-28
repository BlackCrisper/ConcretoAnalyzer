"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FiHome, FiShoppingBag, FiBox } from "react-icons/fi";

export default function NovoProjeto() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo Projeto</h1>
        <p className="text-muted-foreground">Preencha as informações para iniciar um novo projeto de análise estrutural.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Informações do Projeto</CardTitle>
            <p className="text-sm text-muted-foreground">Forneça os detalhes básicos do projeto.</p>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Nome do Projeto</label>
              <Input id="nomeProjeto" placeholder="Ex: Edifício Residencial Aurora" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Descrição</label>
              <Textarea
                id="descricaoProjeto"
                placeholder="Descreva brevemente o projeto e seus objetivos"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Cliente</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled selected>Selecione um cliente</option>
                <option value="1">Construtora Horizonte</option>
                <option value="2">Incorporadora VitaPlus</option>
                <option value="3">MultiTech Industries</option>
                <option value="4">Vision Enterprises</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Tipo de Projeto</label>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                >
                  <FiHome size={20} />
                  <span>Residencial</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                >
                  <FiShoppingBag size={20} />
                  <span>Comercial</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                >
                  <FiBox size={20} />
                  <span>Industrial</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files and Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Arquivos e Detalhes</CardTitle>
            <p className="text-sm text-muted-foreground">Faça upload dos arquivos relevantes e adicione informações específicas.</p>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Data de Entrega Prevista</label>
              <Input type="date" id="dataEntrega" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Plantas e Documentos</label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 border-gray-200 bg-gray-50">
                <FiHome size={36} className="text-gray-400" />
                <p className="text-sm text-center text-muted-foreground">Arraste e solte arquivos aqui ou clique para selecionar</p>
                <Button size="sm" variant="outline">Selecionar Arquivos</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Engenheiro Responsável</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled selected>Selecione um responsável</option>
                <option value="1">João Silva</option>
                <option value="2">Maria Oliveira</option>
                <option value="3">Carlos Santos</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Observações Adicionais</label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o projeto"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancelar</Button>
        <Button type="submit">Criar Projeto</Button>
      </div>
    </div>
  );
}
