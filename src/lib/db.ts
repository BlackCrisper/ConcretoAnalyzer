'use server';

import { Pool, PoolClient } from 'pg';
import { DB_CONFIG } from '../config/env';
import { logger } from './logger';
import { sqlConfig } from './db-config';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;
  private client?: PoolClient;

  private constructor() {
    this.pool = new Pool({
      host: DB_CONFIG.DB_HOST,
      port: DB_CONFIG.DB_PORT,
      database: DB_CONFIG.DB_NAME,
      user: DB_CONFIG.DB_USER,
      password: DB_CONFIG.DB_PASSWORD,
      ssl: DB_CONFIG.DB_SSL ? { rejectUnauthorized: false } : false,
      max: DB_CONFIG.DB_MAX_CONNECTIONS,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.pool.on('connect', () => {
      logger.info('Conectado ao banco de dados');
    });

    this.pool.on('error', error => {
      logger.error('Erro na conexão com banco de dados', { error });
    });

    this.pool.on('remove', () => {
      logger.info('Conexão removida do pool');
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      this.client = await this.pool.connect();
      logger.info('Cliente conectado ao banco de dados');
    } catch (error) {
      logger.error('Erro ao conectar ao banco de dados', { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.release();
        this.client = undefined;
      }
      await this.pool.end();
      logger.info('Desconectado do banco de dados');
    } catch (error) {
      logger.error('Erro ao desconectar do banco de dados', { error });
      throw error;
    }
  }

  public async query<T>(text: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.pool.query(text, params);
      logger.debug('Consulta executada', {
        text,
        params,
        rowCount: result.rowCount,
      });
      return result.rows;
    } catch (error) {
      logger.error('Erro ao executar consulta', {
        error,
        text,
        params,
      });
      throw error;
    }
  }

  public async queryOne<T>(text: string, params?: any[]): Promise<T | null> {
    try {
      const result = await this.pool.query(text, params);
      logger.debug('Consulta única executada', {
        text,
        params,
        rowCount: result.rowCount,
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Erro ao executar consulta única', {
        error,
        text,
        params,
      });
      throw error;
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      logger.debug('Transação concluída com sucesso');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erro na transação', { error });
      throw error;
    } finally {
      client.release();
    }
  }

  public async execute(text: string, params?: any[]): Promise<void> {
    try {
      await this.pool.query(text, params);
      logger.debug('Comando executado', {
        text,
        params,
      });
    } catch (error) {
      logger.error('Erro ao executar comando', {
        error,
        text,
        params,
      });
      throw error;
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Erro ao verificar conexão com banco de dados', { error });
      return false;
    }
  }

  public async getPool(): Promise<Pool> {
    return this.pool;
  }

  public async getClient(): Promise<PoolClient | undefined> {
    return this.client;
  }
}

export const db = DatabaseService.getInstance();

export async function executeQuery<T>(query: string, params?: Record<string, any>): Promise<T[]> {
  const db = DatabaseService.getInstance();
  try {
    return await db.query<T>(query, params ? Object.values(params) : undefined);
  } catch (error) {
    logger.error('Erro ao executar query', { error, query, params });
    throw error;
  }
}

export async function executeTransaction<T>(
  queries: { query: string; params?: Record<string, any> }[]
): Promise<T[][]> {
  const db = DatabaseService.getInstance();
  return db.transaction(async client => {
    const results = [];
    for (const { query, params } of queries) {
      const result = await client.query(query, params ? Object.values(params) : undefined);
      results.push(result.rows);
    }
    return results as T[][];
  });
}
