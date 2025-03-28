import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ProjectReport } from '@/types/project';
import { executeQuery } from '../lib/db';
import ExcelJS from 'exceljs';
import { logger } from '../lib/logger';
import { Report, ReportData } from '../types/report';
import fs from 'fs/promises';
import path from 'path';

export async function generateReport(projectId: string): Promise<ProjectReport> {
  try {
    // Buscar dados do projeto
    const project = await getProjectData(projectId);
    const analysis = await getProjectAnalysis(projectId);
    
    // Gerar relatório técnico
    const technicalReport = await generateTechnicalReport(project, analysis);
    
    // Gerar relatório simplificado
    const simplifiedReport = await generateSimplifiedReport(project, analysis);
    
    // Gerar visualizações
    const visualizations = await generateVisualizations(analysis);
    
    // Criar relatório final
    const report: ProjectReport = {
      projectId,
      summary: {
        builtArea: analysis.totalArea,
        concreteVolume: analysis.totalConcrete,
        steelWeight: analysis.totalSteel,
        recommendedFck: calculateRecommendedFck(analysis)
      },
      materials: {
        concrete: {
          total: analysis.totalConcrete,
          byElement: calculateConcreteByElement(analysis.elements)
        },
        steel: {
          total: analysis.totalSteel,
          byElement: calculateSteelByElement(analysis.elements)
        }
      },
      validations: analysis.inconsistencies.map(inc => ({
        rule: inc.type,
        status: inc.severity === 'high' ? 'failed' : 'passed',
        details: inc.description
      })),
      optimizations: analysis.optimizations,
      visualizations
    };
    
    // Salvar relatório
    await saveReport(report);
    
    // Gerar arquivos de exportação
    await generateExportFiles(report);
    
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

async function getProjectData(projectId: string): Promise<any> {
  const result = await executeQuery(
    `SELECT * FROM Projects WHERE id = @projectId`,
    { projectId }
  );
  return result[0];
}

async function getProjectAnalysis(projectId: string): Promise<any> {
  const result = await executeQuery(
    `SELECT * FROM ProjectReports WHERE project_id = @projectId ORDER BY created_at DESC LIMIT 1`,
    { projectId }
  );
  return result[0];
}

async function generateTechnicalReport(project: any, analysis: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Carregar fonte
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Título
  page.drawText('Relatório Técnico de Análise Estrutural', {
    x: 50,
    y: height - 50,
    size: 20,
    font
  });
  
  // Dados do projeto
  page.drawText(`Projeto: ${project.name}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font
  });
  
  // Resumo
  page.drawText('Resumo do Projeto', {
    x: 50,
    y: height - 120,
    size: 14,
    font
  });
  
  const summary = JSON.parse(analysis.summary);
  page.drawText(`Área Construída: ${summary.builtArea.toFixed(2)} m²`, {
    x: 50,
    y: height - 140,
    size: 12,
    font
  });
  
  page.drawText(`Volume de Concreto: ${summary.concreteVolume.toFixed(2)} m³`, {
    x: 50,
    y: height - 160,
    size: 12,
    font
  });
  
  page.drawText(`Peso do Aço: ${summary.steelWeight.toFixed(2)} kg`, {
    x: 50,
    y: height - 180,
    size: 12,
    font
  });
  
  // Validações
  page.drawText('Validações Técnicas', {
    x: 50,
    y: height - 220,
    size: 14,
    font
  });
  
  const validations = JSON.parse(analysis.validations);
  let y = height - 240;
  for (const validation of validations) {
    page.drawText(`• ${validation.description}`, {
      x: 50,
      y,
      size: 12,
      font
    });
    y -= 20;
  }
  
  // Otimizações
  page.drawText('Sugestões de Otimização', {
    x: 50,
    y: y - 40,
    size: 14,
    font
  });
  
  const optimizations = JSON.parse(analysis.optimizations);
  y -= 60;
  for (const optimization of optimizations) {
    page.drawText(`• ${optimization.description}`, {
      x: 50,
      y,
      size: 12,
      font
    });
    y -= 20;
  }
  
  return await pdfDoc.save();
}

async function generateSimplifiedReport(project: any, analysis: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Título
  page.drawText('Relatório Simplificado', {
    x: 50,
    y: height - 50,
    size: 20,
    font
  });
  
  // Dados do projeto
  page.drawText(`Projeto: ${project.name}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font
  });
  
  // Resumo simplificado
  const summary = JSON.parse(analysis.summary);
  page.drawText('Resumo do Projeto', {
    x: 50,
    y: height - 120,
    size: 14,
    font
  });
  
  page.drawText(`Seu projeto terá:`, {
    x: 50,
    y: height - 140,
    size: 12,
    font
  });
  
  page.drawText(`• ${summary.builtArea.toFixed(2)} m² de área construída`, {
    x: 50,
    y: height - 160,
    size: 12,
    font
  });
  
  page.drawText(`• ${summary.concreteVolume.toFixed(2)} m³ de concreto`, {
    x: 50,
    y: height - 180,
    size: 12,
    font
  });
  
  page.drawText(`• ${summary.steelWeight.toFixed(2)} kg de aço`, {
    x: 50,
    y: height - 200,
    size: 12,
    font
  });
  
  return await pdfDoc.save();
}

async function generateVisualizations(analysis: any): Promise<any[]> {
  const visualizations = [];
  
  // Gráfico de distribuição de concreto
  visualizations.push({
    type: 'chart',
    title: 'Distribuição de Concreto por Elemento',
    data: calculateConcreteDistribution(analysis.elements)
  });
  
  // Gráfico de distribuição de aço
  visualizations.push({
    type: 'chart',
    title: 'Distribuição de Aço por Elemento',
    data: calculateSteelDistribution(analysis.elements)
  });
  
  return visualizations;
}

function calculateRecommendedFck(analysis: any): number {
  // Implementar lógica para calcular fck recomendado
  // Baseado nas cargas e tipo de estrutura
  return 25;
}

function calculateConcreteByElement(elements: any): Record<string, number> {
  const concreteByElement: Record<string, number> = {};
  
  for (const element of elements) {
    const volume = element.dimensions.width * element.dimensions.height * element.dimensions.length;
    concreteByElement[element.type] = (concreteByElement[element.type] || 0) + volume;
  }
  
  return concreteByElement;
}

function calculateSteelByElement(elements: any): Record<string, number> {
  const steelByElement: Record<string, number> = {};
  
  for (const element of elements) {
    const weight = element.materials.steel.weight;
    steelByElement[element.type] = (steelByElement[element.type] || 0) + weight;
  }
  
  return steelByElement;
}

function calculateConcreteDistribution(elements: any): any {
  // Implementar cálculo de distribuição de concreto
  return {
    type: 'pie',
    data: []
  };
}

function calculateSteelDistribution(elements: any): any {
  // Implementar cálculo de distribuição de aço
  return {
    type: 'pie',
    data: []
  };
}

async function saveReport(report: ProjectReport): Promise<void> {
  await executeQuery(
    `INSERT INTO ProjectReports (
      project_id, summary, materials, validations, optimizations, visualizations
    ) VALUES (
      @projectId, @summary, @materials, @validations, @optimizations, @visualizations
    )`,
    {
      projectId: report.projectId,
      summary: JSON.stringify(report.summary),
      materials: JSON.stringify(report.materials),
      validations: JSON.stringify(report.validations),
      optimizations: JSON.stringify(report.optimizations),
      visualizations: JSON.stringify(report.visualizations)
    }
  );
}

async function generateExportFiles(report: ProjectReport): Promise<void> {
  // Gerar Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório');
  
  // Adicionar dados
  worksheet.addRow(['Resumo do Projeto']);
  worksheet.addRow(['Área Construída', report.summary.builtArea]);
  worksheet.addRow(['Volume de Concreto', report.summary.concreteVolume]);
  worksheet.addRow(['Peso do Aço', report.summary.steelWeight]);
  
  // Salvar arquivo
  await workbook.xlsx.writeFile(`reports/${report.projectId}.xlsx`);
} 