import { createWorker } from 'tesseract.js';
import { ProjectFile, ExtractedData } from '../types/project';
import { executeQuery } from '../lib/db';
import * as pdfjsLib from 'pdfjs-dist';
import * as fs from 'fs';
import * as path from 'path';

export async function processProjectFile(file: ProjectFile): Promise<ExtractedData> {
  try {
    // Atualizar status do arquivo
    await updateFileStatus(file.id, 'processing');
    
    // Inicializar worker do Tesseract
    const worker = await createWorker('por');
    
    let extractedData: ExtractedData = {
      elements: [],
      tables: [],
      notes: []
    };
    
    // Processar arquivo baseado no tipo
    switch (file.type) {
      case 'PDF':
        extractedData = await processPDF(file, worker);
        break;
      case 'IMAGE':
        extractedData = await processImage(file, worker);
        break;
      case 'DWG':
        extractedData = await processDWG(file);
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

async function processPDF(file: ProjectFile, worker: any): Promise<ExtractedData> {
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
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Extrair texto
    const text = textContent.items.map((item: any) => item.str).join(' ');
    
    // Extrair elementos estruturais
    const elements = extractStructuredElements(text);
    extractedData.elements.push(...elements);
    
    // Extrair tabelas
    const tables = await extractTables(page, viewport);
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

async function processDWG(file: ProjectFile): Promise<ExtractedData> {
  // TODO: Implementar processamento de arquivos DWG
  // Isso requer uma biblioteca específica para DWG
  throw new Error('DWG processing not implemented yet');
}

function extractStructuredElements(text: string): any[] {
  const elements: any[] = [];
  
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

async function extractTables(page: any, viewport: any): Promise<any[]> {
  const tables: any[] = [];
  
  // TODO: Implementar extração de tabelas
  // Isso requer análise do layout da página e detecção de estruturas tabulares
  
  return tables;
}

function extractTechnicalNotes(text: string): any[] {
  const notes: any[] = [];
  
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
        type,
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
    { fileId, status }
  );
}

async function saveExtractedData(projectId: string, data: ExtractedData): Promise<void> {
  // Salvar elementos estruturais
  for (const element of data.elements) {
    await executeQuery(
      `INSERT INTO StructuralElements (
        project_id, type, number, dimensions, materials, location
      ) VALUES (
        @projectId, @type, @number, @dimensions, @materials, @location
      )`,
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
  }
  
  // Salvar tabelas
  for (const table of data.tables) {
    await executeQuery(
      `INSERT INTO Tables (
        project_id, type, data, location
      ) VALUES (
        @projectId, @type, @data, @location
      )`,
      {
        projectId,
        type: table.type,
        data: JSON.stringify(table.data),
        location: JSON.stringify(table.location)
      }
    );
  }
  
  // Salvar notas técnicas
  for (const note of data.notes) {
    await executeQuery(
      `INSERT INTO TechnicalNotes (
        project_id, type, content, location
      ) VALUES (
        @projectId, @type, @content, @location
      )`,
      {
        projectId,
        type: note.type,
        content: note.content,
        location: JSON.stringify(note.location)
      }
    );
  }
} 