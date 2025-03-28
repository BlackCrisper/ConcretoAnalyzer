import { Pool } from 'pg';
import { logger } from './logger';
import { DB_CONFIG } from '../config/env';

// Criar pool de conexões
const pool = new Pool({
  user: DB_CONFIG.DB_USER,
  host: DB_CONFIG.DB_HOST,
  database: DB_CONFIG.DB_NAME,
  password: DB_CONFIG.DB_PASSWORD,
  port: DB_CONFIG.DB_PORT,
  ssl: DB_CONFIG.DB_SSL ? { rejectUnauthorized: false } : false,
  max: DB_CONFIG.DB_MAX_CONNECTIONS,
  idleTimeoutMillis: DB_CONFIG.DB_IDLE_TIMEOUT,
  connectionTimeoutMillis: DB_CONFIG.DB_CONNECTION_TIMEOUT
});

// Eventos do pool
pool.on('connect', () => {
  logger.info('Nova conexão com o banco de dados estabelecida');
});

pool.on('error', (err) => {
  logger.error('Erro no pool de conexões do banco de dados', { error: err });
});

pool.on('remove', () => {
  logger.info('Conexão removida do pool');
});

// Função para testar a conexão
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    logger.info('Conexão com o banco de dados testada com sucesso');
    return true;
  } catch (error) {
    logger.error('Erro ao testar conexão com o banco de dados', { error });
    return false;
  }
}

// Função para executar queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executada', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Erro ao executar query', { text, error });
    throw error;
  }
}

// Função para obter uma conexão do pool
export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Estabelecer timeout para liberar a conexão
  const timeout = setTimeout(() => {
    logger.error('Conexão não liberada após timeout');
    release();
  }, DB_CONFIG.DB_CONNECTION_TIMEOUT);

  // Substituir a função release para limpar o timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
}

// Função para iniciar uma transação
export async function beginTransaction() {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
}

// Função para finalizar uma transação
export async function endTransaction(client: any, success: boolean) {
  try {
    if (success) {
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }
  } finally {
    client.release();
  }
}

// Função para encerrar o pool
export async function closePool() {
  try {
    await pool.end();
    logger.info('Pool de conexões encerrado');
  } catch (error) {
    logger.error('Erro ao encerrar pool de conexões', { error });
    throw error;
  }
}

export default pool; 