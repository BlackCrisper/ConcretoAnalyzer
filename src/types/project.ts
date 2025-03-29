// Tipos de usuário
export type UserRole = 'admin' | 'engineer' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

// Tipos de projeto
export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de arquivo
export type FileType = 'pdf' | 'image' | 'dwg';
export type FileStatus = 'pending' | 'processing' | 'processed' | 'error';

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: FileType;
  path: string;
  size: number;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de elementos estruturais
export interface StructuralElement {
  id: string;
  type: 'pillar' | 'beam' | 'slab';
  dimensions: {
    width: number;
    height: number;
    length: number;
    thickness?: number;
  };
  materials: {
    concrete: {
      fck: number;
    };
    steel: {
      weight: number;
    };
  };
}

// Tipos de análise
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Inconsistency {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  elementId: string;
  rule: string;
}

export interface Optimization {
  type: 'concrete' | 'steel' | 'dimensions';
  description: string;
  potentialSavings: {
    concrete?: number;
    steel?: number;
    cost: number;
  };
  elementId: string;
}

export interface StructuralAnalysis {
  projectId: string;
  elements: StructuralElement[];
  totalArea: number;
  totalConcrete: number;
  totalSteel: number;
  inconsistencies: Inconsistency[];
  optimizations: Optimization[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de relatório
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'error';
export type ReportType = 'technical' | 'simplified' | 'summary';

export interface ProjectReport {
  id: string;
  projectId: string;
  analysisId: string;
  name: string;
  type: ReportType;
  content: {
    summary: string;
    elements: {
      type: string;
      details: any[];
    }[];
    calculations: {
      type: string;
      results: any[];
    }[];
    recommendations: string[];
    attachments: {
      name: string;
      type: string;
      url: string;
    }[];
  };
  status: ReportStatus;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de compartilhamento
export type AccessLevel = 'view' | 'edit';

export interface SharedReport {
  id: string;
  reportId: string;
  userId: string;
  accessLevel: AccessLevel;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de paginação
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos de dados extraídos
export interface ExtractedData {
  elements: any[];
  tables: any[];
  notes: any[];
} 