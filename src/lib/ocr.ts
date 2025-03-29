import { createWorker, createScheduler, Worker, RecognizeResult } from 'tesseract.js';
import { OCR_CONFIG } from '../config/env';
import { logger } from './logger';
import { OCRResult, OCRConfig } from '../types/ocr';

export class OCRService {
  private static instance: OCRService;
  private worker: Worker | null = null;
  private config: OCRConfig;

  private constructor() {
    this.config = {
      modelPath: OCR_CONFIG.MODEL_PATH,
      language: OCR_CONFIG.LANGUAGE,
      confidenceThreshold: OCR_CONFIG.CONFIDENCE_THRESHOLD,
      maxRetries: OCR_CONFIG.MAX_RETRIES,
      timeout: OCR_CONFIG.TIMEOUT
    };
  }

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.worker) {
        logger.debug('OCR já inicializado');
        return;
      }

      this.worker = await createWorker({
        logger: (m) => {
          logger.debug('OCR Progress', { message: m });
        }
      });

      await this.worker.loadLanguage(this.config.language);
      await this.worker.initialize(this.config.language);
      logger.info('OCR inicializado com sucesso');
    } catch (error) {
      logger.error('Erro ao inicializar OCR', { error });
      throw error;
    }
  }

  public async recognize(imagePath: string): Promise<OCRResult> {
    try {
      if (!this.worker) {
        await this.initialize();
      }

      const result = await this.worker!.recognize(imagePath);
      
      if (result.data.confidence < this.config.confidenceThreshold) {
        logger.warn('Baixa confiança no reconhecimento', {
          confidence: result.data.confidence,
          threshold: this.config.confidenceThreshold
        });
      }

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        blocks: result.data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0
          }
        }))
      };
    } catch (error) {
      logger.error('Erro ao reconhecer texto', { error, imagePath });
      throw error;
    }
  }

  public async terminate(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
        logger.info('OCR encerrado com sucesso');
      }
    } catch (error) {
      logger.error('Erro ao encerrar OCR', { error });
      throw error;
    }
  }

  public getProgress(): { status: string; progress: number } {
    if (!this.worker) {
      return {
        status: 'initializing api',
        progress: 0
      };
    }

    return {
      status: 'processing',
      progress: 0
    };
  }

  public getMaxRetries(): number {
    return this.config.maxRetries;
  }
}

export const ocrService = OCRService.getInstance();

export async function recognizeText(imagePath: string): Promise<string> {
  try {
    const result = await ocrService.recognize(imagePath);
    return result.text;
  } catch (error) {
    logger.error('Erro ao reconhecer texto', { error, imagePath });
    throw error;
  }
}

export async function recognizeTextWithRetry(
  imagePath: string,
  maxRetries: number = ocrService.getMaxRetries()
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await recognizeText(imagePath);
    } catch (error) {
      lastError = error as Error;
      logger.warn('Tentativa de reconhecimento falhou', {
        attempt: i + 1,
        maxRetries,
        error
      });
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError || new Error('Todas as tentativas de reconhecimento falharam');
}

export async function detectTables(imagePath: string): Promise<any[]> {
  try {
    const result = await ocrService.recognize(imagePath);
    return extractTablesFromText(result.text);
  } catch (error) {
    logger.error('Erro ao detectar tabelas', { error, imagePath });
    throw error;
  }
}

export async function detectStructuralElements(imagePath: string): Promise<any[]> {
  try {
    const result = await ocrService.recognize(imagePath);
    return extractStructuralElementsFromText(result.text);
  } catch (error) {
    logger.error('Erro ao detectar elementos estruturais', { error, imagePath });
    throw error;
  }
}

interface TableCell {
  [key: string]: string;
}

function extractTablesFromText(text: string): any[] {
  const tables: any[] = [];
  const lines = text.split('\n');
  let currentTable: any = null;

  for (const line of lines) {
    if (line.includes('|')) {
      if (!currentTable) {
        currentTable = {
          headers: line.split('|').map(h => h.trim()),
          rows: []
        };
      } else {
        currentTable.rows.push(
          line.split('|').reduce((acc: TableCell, cell, i) => {
            acc[currentTable.headers[i]] = cell.trim();
            return acc;
          }, {})
        );
      }
    } else if (currentTable) {
      tables.push(currentTable);
      currentTable = null;
    }
  }

  if (currentTable) {
    tables.push(currentTable);
  }

  return tables;
}

function extractStructuralElementsFromText(text: string): any[] {
  const elements: any[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Implementar lógica de extração de elementos estruturais
    // Esta é uma implementação simplificada
    const pillarMatch = line.match(/Pilar\s+(\w+)\s+(\d+)x(\d+)/);
    if (pillarMatch) {
      elements.push({
        type: 'pillar',
        number: pillarMatch[1],
        dimensions: {
          width: Number(pillarMatch[2]),
          height: Number(pillarMatch[3])
        }
      });
    }

    const beamMatch = line.match(/Viga\s+(\w+)\s+(\d+)x(\d+)/);
    if (beamMatch) {
      elements.push({
        type: 'beam',
        number: beamMatch[1],
        dimensions: {
          width: Number(beamMatch[2]),
          height: Number(beamMatch[3])
        }
      });
    }

    const slabMatch = line.match(/Laje\s+(\w+)\s+(\d+)/);
    if (slabMatch) {
      elements.push({
        type: 'slab',
        number: slabMatch[1],
        dimensions: {
          thickness: Number(slabMatch[2])
        }
      });
    }
  }

  return elements;
} 