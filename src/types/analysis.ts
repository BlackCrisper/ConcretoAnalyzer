import { StructuralAnalysis } from './project';

export interface AnalysisResult {
  analysis: StructuralAnalysis;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}
