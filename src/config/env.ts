import { config } from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
config({ path: path.join(__dirname, '../../.env') });

// Configurações do banco de dados
export const DB_CONFIG = {
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'estrutura_db',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_SSL: process.env.DB_SSL === 'true',
  DB_MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  DB_IDLE_TIMEOUT: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  DB_CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000')
};

// Configurações do servidor
export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api'
};

// Configurações de JWT
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Configurações de email
export const EMAIL_CONFIG = {
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@example.com',
  FROM_NAME: process.env.FROM_NAME || 'Sistema de Estruturas'
};

// Configurações de upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,image/*,dwg').split(','),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  TEMP_DIR: process.env.TEMP_DIR || 'temp'
};

// Configurações de Redis
export const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379'),
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DB: parseInt(process.env.REDIS_DB || '0'),
  KEY_PREFIX: process.env.REDIS_KEY_PREFIX || 'estrutura:'
};

// Configurações de rate limit
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  AUTH_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hora
  AUTH_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5')
};

// Configurações de OCR
export const OCR_CONFIG = {
  MODEL_PATH: process.env.OCR_MODEL_PATH || 'models',
  LANGUAGE: process.env.OCR_LANGUAGE || 'por',
  CONFIDENCE_THRESHOLD: parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD || '0.7'),
  MAX_RETRIES: parseInt(process.env.OCR_MAX_RETRIES || '3'),
  TIMEOUT: parseInt(process.env.OCR_TIMEOUT || '30000')
};

// Configurações de cache
export const CACHE_CONFIG = {
  TTL: parseInt(process.env.CACHE_TTL || '3600'),
  MAX_ITEMS: parseInt(process.env.CACHE_MAX_ITEMS || '1000'),
  CHECK_PERIOD: parseInt(process.env.CACHE_CHECK_PERIOD || '600')
};

// Configurações de logging
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.LOG_FORMAT || 'json',
  DIR: process.env.LOG_DIR || 'logs',
  MAX_SIZE: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
  MAX_FILES: parseInt(process.env.LOG_MAX_FILES || '5')
}; 