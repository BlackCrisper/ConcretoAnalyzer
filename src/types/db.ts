import { Pool, PoolClient, QueryResult } from 'pg';
import {
  User,
  Project,
  ProjectFile,
  StructuralElement,
  StructuralAnalysis,
  ProjectReport,
  SharedReport,
} from './project';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface DatabaseConnection {
  pool: Pool;
  client?: PoolClient;
}

export interface QueryParams {
  text: string;
  values?: any[];
}

export interface TransactionCallback<T> {
  (client: PoolClient): Promise<T>;
}

export interface DatabaseError extends Error {
  code: string;
  detail?: string;
  hint?: string;
  where?: string;
}

export interface DatabaseResult<T> {
  rows: T[];
  rowCount: number;
  fields: any[];
}

export interface DatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(params: QueryParams): Promise<DatabaseResult<T>>;
  transaction<T>(callback: TransactionCallback<T>): Promise<T>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

// Tipos específicos para queries
export interface UserQuery extends User {
  password: string;
}

export interface ProjectQuery extends Project {
  user: User;
  files: ProjectFile[];
  elements: StructuralElement[];
  analysis: StructuralAnalysis[];
  reports: ProjectReport[];
}

export interface ProjectFileQuery extends ProjectFile {
  project: Project;
  elements: StructuralElement[];
}

export interface StructuralElementQuery extends StructuralElement {
  project: Project;
  file: ProjectFile;
}

export interface StructuralAnalysisQuery extends StructuralAnalysis {
  project: Project;
  report: ProjectReport;
}

export interface ProjectReportQuery extends ProjectReport {
  project: Project;
  analysis: StructuralAnalysis;
  shares: SharedReport[];
}

export interface SharedReportQuery extends SharedReport {
  report: ProjectReport;
  user: User;
}

// Tipos para resultados de queries
export type UserResult = QueryResult<UserQuery>;
export type ProjectResult = QueryResult<ProjectQuery>;
export type ProjectFileResult = QueryResult<ProjectFileQuery>;
export type StructuralElementResult = QueryResult<StructuralElementQuery>;
export type StructuralAnalysisResult = QueryResult<StructuralAnalysisQuery>;
export type ProjectReportResult = QueryResult<ProjectReportQuery>;
export type SharedReportResult = QueryResult<SharedReportQuery>;
