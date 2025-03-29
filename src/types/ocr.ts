export interface OCRResult {
  text: string;
  confidence: number;
  blocks: OCRWord[];
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  lines: OCRLine[];
}

export interface OCRLine {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  words: OCRWord[];
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
}

export interface Table {
  headers: string[];
  rows: TableRow[];
  bbox?: BoundingBox;
}

export interface TableRow {
  [key: string]: string;
}

export interface StructuralElement {
  type: 'pillar' | 'beam' | 'slab';
  number: string;
  dimensions: {
    width?: number;
    height?: number;
    thickness?: number;
  };
  bbox?: BoundingBox;
  confidence: number;
}

export interface OCRConfig {
  modelPath: string;
  language: string;
  confidenceThreshold: number;
  maxRetries: number;
  timeout: number;
}

export interface OCRWorker {
  initialize: (language: string) => Promise<void>;
  recognize: (imagePath: string) => Promise<OCRResult>;
  terminate: () => Promise<void>;
}

export interface OCRProgress {
  status:
    | 'recognizing text'
    | 'loading tesseract core'
    | 'loading language traineddata'
    | 'initializing api';
  progress: number;
  data?: any;
}
