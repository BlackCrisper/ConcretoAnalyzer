import { createWorker } from 'tesseract.js';
import { ProjectFile, ExtractedData } from '../types/project';
import { executeQuery } from '../lib/db';
import * as pdfjsLib from 'pdfjs-dist';
import * as fs from 'fs';
import * as path from 'path';

interface IdResult {
  id: string;
}

interface CountResult {
  count: number;
}

interface StructuredElement {
  type: 'pillar' | 'beam' | 'slab';
  number: string;
  dimensions: {
    width?: number;
    height?: number;
    thickness?: number;
  };
}

interface TechnicalNote {
  type: 'fck' | 'steel' | 'load';
  content: string;
  value: number;
}

interface Table {
  type: string;
  data: any;
  location: {
    page: number;
    x: number;
    y: number;
  };
}

export async function processProjectFile(file: ProjectFile): Promise<ExtractedData> {
  try {
    // Atualizar status do arquivo
    await updateFileStatus(file.id, 'processing');
    
    // Inicializar worker do Tesseract
    const worker = await createWorker({
      langPath: process.env.OCR_MODEL_PATH
    });
    await worker.loadLanguage('por');
    await worker.initialize('por');
    
    let extractedData: ExtractedData = {
      elements: [],
      tables: [],
      notes: []
    };
    
    // Processar arquivo baseado no tipo
    switch (file.type) {
      case 'pdf':
        extractedData = await processPDF(file);
        break;
      case 'image':
        extractedData = await processImage(file, worker);
        break;
      case 'dwg':
        extractedData = await processDWG();
        break;
    }
    
    // Salvar dados extraídos
    await saveExtractedData(file.projectId, extractedData);
    
    // Atualizar status do arquivo
    await updateFileStatus(file.id, 'completed');
    
    return extractedData;
  } catch (error) {
    console.error('Error processing file:', error);
    await updateFileStatus(file.id, 'error');
    throw error;
  }
}

async function processPDF(file: ProjectFile): Promise<ExtractedData> {
  const pdfPath = path.join(process.cwd(), file.path);
  const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  
  const extractedData: ExtractedData = {
    elements: [],
    tables: [],
    notes: []
  };
  
  // Processar cada página
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Extrair texto
    const text = textContent.items.map((item: any) => item.str).join(' ');
    
    // Extrair elementos estruturais
    const elements = extractStructuredElements(text);
    extractedData.elements.push(...elements);
    
    // Extrair tabelas
    const tables = await extractTables();
    extractedData.tables.push(...tables);
    
    // Extrair notas técnicas
    const notes = extractTechnicalNotes(text);
    extractedData.notes.push(...notes);
  }
  
  return extractedData;
}

async function processImage(file: ProjectFile, worker: any): Promise<ExtractedData> {
  const imagePath = path.join(process.cwd(), file.path);
  
  // Realizar OCR na imagem
  const { data: { text } } = await worker.recognize(imagePath);
  
  return {
    elements: extractStructuredElements(text),
    tables: [],
    notes: extractTechnicalNotes(text)
  };
}

async function processDWG(): Promise<ExtractedData> {
  // TODO: Implementar processamento de arquivos DWG
  // Isso requer uma biblioteca específica para DWG
  throw new Error('DWG processing not implemented yet');
}

function extractStructuredElements(text: string): StructuredElement[] {
  const elements: StructuredElement[] = [];
  
  // Padrões para extrair elementos estruturais
  const patterns = {
    pillar: /Pilar\s+(\d+)\s*:\s*(\d+)x(\d+)/g,
    beam: /Viga\s+(\d+)\s*:\s*(\d+)x(\d+)/g,
    slab: /Laje\s+(\d+)\s*:\s*(\d+)cm/g
  };
  
  // Extrair pilares
  let match;
  while ((match = patterns.pillar.exec(text)) !== null) {
    elements.push({
      type: 'pillar',
      number: match[1],
      dimensions: {
        width: parseInt(match[2]),
        height: parseInt(match[3])
      }
    });
  }
  
  // Extrair vigas
  while ((match = patterns.beam.exec(text)) !== null) {
    elements.push({
      type: 'beam',
      number: match[1],
      dimensions: {
        width: parseInt(match[2]),
        height: parseInt(match[3])
      }
    });
  }
  
  // Extrair lajes
  while ((match = patterns.slab.exec(text)) !== null) {
    elements.push({
      type: 'slab',
      number: match[1],
      dimensions: {
        thickness: parseInt(match[2])
      }
    });
  }
  
  return elements;
}

async function extractTables(): Promise<Table[]> {
  const tables: Table[] = [];
  
  // TODO: Implementar extração de tabelas
  // Isso requer análise do layout da página e detecção de estruturas tabulares
  
  return tables;
}

function extractTechnicalNotes(text: string): TechnicalNote[] {
  const notes: TechnicalNote[] = [];
  
  // Padrões para extrair notas técnicas
  const patterns = {
    fck: /fck\s*=\s*(\d+)/gi,
    steel: /aço\s*=\s*(\d+\.?\d*)\s*%/gi,
    load: /carga\s*=\s*(\d+\.?\d*)\s*kN\/m²/gi
  };
  
  // Extrair notas
  for (const [type, pattern] of Object.entries(patterns)) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      notes.push({
        type: type as 'fck' | 'steel' | 'load',
        content: match[0],
        value: parseFloat(match[1])
      });
    }
  }
  
  return notes;
}

async function updateFileStatus(fileId: string, status: string): Promise<void> {
  await executeQuery(
    `UPDATE ProjectFiles 
     SET status = @status, updated_at = GETDATE()
     WHERE id = @fileId`,
    { status, fileId }
  );
}

async function saveExtractedData(projectId: string, data: ExtractedData): Promise<void> {
  // Salvar elementos estruturais
  for (const element of data.elements) {
    const result = await executeQuery<IdResult>(
      `INSERT INTO StructuralElements (
        project_id, type, number, dimensions, materials, location
      ) VALUES (
        @projectId, @type, @number, @dimensions, @materials, @location
      );
      SELECT SCOPE_IDENTITY() AS id;`,
      {
        projectId,
        type: element.type,
        number: element.number,
        dimensions: JSON.stringify(element.dimensions),
        materials: JSON.stringify({
          concrete: { fck: 25, volume: 0 },
          steel: { ratio: 0, weight: 0 }
        }),
        location: JSON.stringify({
          level: 0,
          position: ''
        })
      }
    );

    if (!result[0]?.id) {
      throw new Error('Failed to save structural element');
    }
  }
  
  // Salvar tabelas
  for (const table of data.tables) {
    const result = await executeQuery<IdResult>(
      `INSERT INTO Tables (
        project_id, type, data, location
      ) VALUES (
        @projectId, @type, @data, @location
      );
      SELECT SCOPE_IDENTITY() AS id;`,
      {
        projectId,
        type: table.type,
        data: JSON.stringify(table.data),
        location: JSON.stringify(table.location)
      }
    );

    if (!result[0]?.id) {
      throw new Error('Failed to save table');
    }
  }
  
  // Salvar notas técnicas
  for (const note of data.notes) {
    const result = await executeQuery<IdResult>(
      `INSERT INTO TechnicalNotes (
        project_id, type, content, location
      ) VALUES (
        @projectId, @type, @content, @location
      );
      SELECT SCOPE_IDENTITY() AS id;`,
      {
        projectId,
        type: note.type,
        content: note.content,
        location: JSON.stringify({
          page: 0,
          x: 0,
          y: 0
        })
      }
    );

    if (!result[0]?.id) {
      throw new Error('Failed to save technical note');
    }
  }
} 