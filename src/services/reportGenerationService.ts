import { PDFDocument, StandardFonts } from 'pdf-lib';
import { executeQuery } from '../lib/db';

interface ProjectReport {
  projectId: string;
  summary: {
    builtArea: number;
    concreteVolume: number;
    steelWeight: number;
    recommendedFck: number;
  };
  materials: {
    concrete: {
      total: number;
      byElement: Record<string, number>;
    };
    steel: {
      total: number;
      byElement: Record<string, number>;
    };
  };
  validations: Array<{
    rule: string;
    status: string;
    details: string;
  }>;
  optimizations: Array<{
    description: string;
  }>;
  visualizations: Array<{
    type: string;
    title: string;
    data: any;
  }>;
}

interface Project {
  id: string;
  name: string;
}

interface Analysis {
  id: string;
  summary: string;
  validations: string;
  optimizations: string;
  elements: Array<{
    type: string;
    concrete: number;
    steel: number;
  }>;
  totalArea: number;
  totalConcrete: number;
  totalSteel: number;
  inconsistencies: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
}

interface IdResult {
  id: string;
}

interface CountResult {
  count: number;
}

export async function generateReport(projectId: string): Promise<ProjectReport> {
  try {
    // Buscar dados do projeto
    const project = await getProjectData(projectId);
    const analysis = await getProjectAnalysis(projectId);

    // Gerar relatório técnico
    await generateTechnicalReport(project, analysis);

    // Gerar relatório simplificado
    await generateSimplifiedReport(project, analysis);

    // Gerar visualizações
    const visualizations = await generateVisualizations(analysis);

    // Criar relatório final
    const report: ProjectReport = {
      projectId,
      summary: {
        builtArea: analysis.totalArea,
        concreteVolume: analysis.totalConcrete,
        steelWeight: analysis.totalSteel,
        recommendedFck: calculateRecommendedFck(),
      },
      materials: {
        concrete: {
          total: analysis.totalConcrete,
          byElement: calculateConcreteByElement(analysis.elements),
        },
        steel: {
          total: analysis.totalSteel,
          byElement: calculateSteelByElement(analysis.elements),
        },
      },
      validations: analysis.inconsistencies.map(inc => ({
        rule: inc.type,
        status: inc.severity === 'high' ? 'failed' : 'passed',
        details: inc.description,
      })),
      optimizations: JSON.parse(analysis.optimizations),
      visualizations,
    };

    // Salvar relatório
    await saveReport(report);

    // Gerar arquivos de exportação
    await generateExportFiles();

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

async function getProjectData(projectId: string): Promise<Project> {
  const result = await executeQuery<Project>(`SELECT * FROM Projects WHERE id = @projectId`, {
    projectId,
  });
  return result[0];
}

async function getProjectAnalysis(projectId: string): Promise<Analysis> {
  const result = await executeQuery<Analysis>(
    `SELECT * FROM ProjectReports WHERE project_id = @projectId ORDER BY created_at DESC LIMIT 1`,
    { projectId }
  );
  return result[0];
}

async function generateTechnicalReport(project: Project, analysis: Analysis): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();

  // Carregar fonte
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Título
  page.drawText('Relatório Técnico de Análise Estrutural', {
    x: 50,
    y: height - 50,
    size: 20,
    font,
  });

  // Dados do projeto
  page.drawText(`Projeto: ${project.name}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font,
  });

  // Resumo
  page.drawText('Resumo do Projeto', {
    x: 50,
    y: height - 120,
    size: 14,
    font,
  });

  const summary = JSON.parse(analysis.summary);
  page.drawText(`Área Construída: ${summary.builtArea.toFixed(2)} m²`, {
    x: 50,
    y: height - 140,
    size: 12,
    font,
  });

  page.drawText(`Volume de Concreto: ${summary.concreteVolume.toFixed(2)} m³`, {
    x: 50,
    y: height - 160,
    size: 12,
    font,
  });

  page.drawText(`Peso do Aço: ${summary.steelWeight.toFixed(2)} kg`, {
    x: 50,
    y: height - 180,
    size: 12,
    font,
  });

  // Validações
  page.drawText('Validações Técnicas', {
    x: 50,
    y: height - 220,
    size: 14,
    font,
  });

  const validations = JSON.parse(analysis.validations);
  let y = height - 240;
  for (const validation of validations) {
    page.drawText(`• ${validation.description}`, {
      x: 50,
      y,
      size: 12,
      font,
    });
    y -= 20;
  }

  // Otimizações
  page.drawText('Sugestões de Otimização', {
    x: 50,
    y: y - 40,
    size: 14,
    font,
  });

  const optimizations = JSON.parse(analysis.optimizations);
  y -= 60;
  for (const optimization of optimizations) {
    page.drawText(`• ${optimization.description}`, {
      x: 50,
      y,
      size: 12,
      font,
    });
    y -= 20;
  }

  return await pdfDoc.save();
}

async function generateSimplifiedReport(project: Project, analysis: Analysis): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Título
  page.drawText('Relatório Simplificado', {
    x: 50,
    y: height - 50,
    size: 20,
    font,
  });

  // Dados do projeto
  page.drawText(`Projeto: ${project.name}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font,
  });

  // Resumo
  page.drawText('Resumo', {
    x: 50,
    y: height - 120,
    size: 14,
    font,
  });

  page.drawText(`Área Total: ${analysis.totalArea.toFixed(2)} m²`, {
    x: 50,
    y: height - 140,
    size: 12,
    font,
  });

  page.drawText(`Concreto Total: ${analysis.totalConcrete.toFixed(2)} m³`, {
    x: 50,
    y: height - 160,
    size: 12,
    font,
  });

  page.drawText(`Aço Total: ${analysis.totalSteel.toFixed(2)} kg`, {
    x: 50,
    y: height - 180,
    size: 12,
    font,
  });

  // Distribuição de Materiais
  page.drawText('Distribuição de Materiais', {
    x: 50,
    y: height - 220,
    size: 14,
    font,
  });

  const concreteDistribution = calculateConcreteDistribution(analysis.elements);
  const steelDistribution = calculateSteelDistribution(analysis.elements);

  let y = height - 240;
  for (const [element, value] of Object.entries(concreteDistribution)) {
    page.drawText(`${element}: ${value.toFixed(2)} m³`, {
      x: 50,
      y,
      size: 12,
      font,
    });
    y -= 20;
  }

  y -= 20;
  page.drawText('Distribuição de Aço:', {
    x: 50,
    y,
    size: 12,
    font,
  });

  y -= 20;
  for (const [element, value] of Object.entries(steelDistribution)) {
    page.drawText(`${element}: ${value.toFixed(2)} kg`, {
      x: 50,
      y,
      size: 12,
      font,
    });
    y -= 20;
  }

  return await pdfDoc.save();
}

async function generateVisualizations(analysis: Analysis): Promise<
  Array<{
    type: string;
    title: string;
    data: any;
  }>
> {
  return [
    {
      type: 'pie',
      title: 'Distribuição de Concreto por Elemento',
      data: calculateConcreteDistribution(analysis.elements),
    },
    {
      type: 'pie',
      title: 'Distribuição de Aço por Elemento',
      data: calculateSteelDistribution(analysis.elements),
    },
  ];
}

function calculateRecommendedFck(): number {
  // Implementar lógica de cálculo do fck recomendado
  return 25; // Valor padrão
}

function calculateConcreteByElement(
  elements: Array<{ type: string; concrete: number }>
): Record<string, number> {
  return elements.reduce((acc, element) => {
    acc[element.type] = (acc[element.type] || 0) + element.concrete;
    return acc;
  }, {} as Record<string, number>);
}

function calculateSteelByElement(
  elements: Array<{ type: string; steel: number }>
): Record<string, number> {
  return elements.reduce((acc, element) => {
    acc[element.type] = (acc[element.type] || 0) + element.steel;
    return acc;
  }, {} as Record<string, number>);
}

function calculateConcreteDistribution(
  elements: Array<{ type: string; concrete: number }>
): Record<string, number> {
  return calculateConcreteByElement(elements);
}

function calculateSteelDistribution(
  elements: Array<{ type: string; steel: number }>
): Record<string, number> {
  return calculateSteelByElement(elements);
}

async function saveReport(report: ProjectReport): Promise<void> {
  const result = await executeQuery<IdResult>(
    `
    INSERT INTO Reports (
      project_id, summary, materials, validations, optimizations, visualizations,
      created_at, updated_at
    )
    VALUES (
      @projectId, @summary, @materials, @validations, @optimizations, @visualizations,
      GETDATE(), GETDATE()
    );
    SELECT SCOPE_IDENTITY() AS id;
  `,
    {
      projectId: report.projectId,
      summary: JSON.stringify(report.summary),
      materials: JSON.stringify(report.materials),
      validations: JSON.stringify(report.validations),
      optimizations: JSON.stringify(report.optimizations),
      visualizations: JSON.stringify(report.visualizations),
    }
  );

  if (!result[0]?.id) {
    throw new Error('Failed to save report');
  }
}

async function generateExportFiles(): Promise<void> {
  // Implementar geração de arquivos de exportação (Excel, CSV, etc.)
}
