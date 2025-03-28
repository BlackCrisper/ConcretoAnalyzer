import winston from 'winston';
import path from 'path';
import { LOG_CONFIG } from '../config/env';

// Criar diretório de logs se não existir
const logDir = path.join(process.cwd(), 'logs');
if (!require('fs').existsSync(logDir)) {
  require('fs').mkdirSync(logDir, { recursive: true });
}

// Configurar formatos
const formats = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  LOG_CONFIG.FORMAT === 'json'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
);

// Configurar transportes
const transports: winston.transport[] = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: LOG_CONFIG.MAX_SIZE,
    maxFiles: LOG_CONFIG.MAX_FILES
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: LOG_CONFIG.MAX_SIZE,
    maxFiles: LOG_CONFIG.MAX_FILES
  })
];

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// Criar logger
export const logger = winston.createLogger({
  level: LOG_CONFIG.LEVEL,
  format: formats,
  transports,
  exitOnError: false
});

// Função para criar um logger específico para um módulo
export function createLogger(module: string) {
  return winston.createLogger({
    level: LOG_CONFIG.LEVEL,
    format: formats,
    transports: [
      ...transports,
      new winston.transports.File({
        filename: path.join(LOG_CONFIG.DIR, `${module}.log`),
        maxsize: LOG_CONFIG.MAX_SIZE,
        maxFiles: LOG_CONFIG.MAX_FILES
      })
    ],
    defaultMeta: { module }
  });
}

// Função para criar um logger específico para HTTP
export function createHttpLogger() {
  return winston.createLogger({
    level: LOG_CONFIG.LEVEL,
    format: formats,
    transports: [
      new winston.transports.File({
        filename: path.join(LOG_CONFIG.DIR, 'http.log'),
        maxsize: LOG_CONFIG.MAX_SIZE,
        maxFiles: LOG_CONFIG.MAX_FILES
      })
    ]
  });
}

// Middleware para logging de requisições HTTP
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Requisição HTTP', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  next();
};

// Função para log de requisição
export function logRequest(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}

// Função para log de erro
export function logError(error: Error, req?: any) {
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: req ? {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    } : undefined
  });
}

// Função para log de acesso
export function logAccess(req: any, res: any) {
  logger.info('Access granted', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
}

// Função para log de autenticação
export function logAuth(action: string, userId: string, ip: string) {
  logger.info('Authentication', {
    action,
    userId,
    ip
  });
}

// Função para log de operações de arquivo
export function logFileOperation(operation: string, fileId: string, userId: string) {
  logger.info('File operation', {
    operation,
    fileId,
    userId
  });
}

// Função para log de análise estrutural
export function logAnalysis(projectId: string, userId: string, status: string) {
  logger.info('Structural analysis', {
    projectId,
    userId,
    status
  });
}

// Função para log de geração de relatório
export function logReport(projectId: string, userId: string, status: string) {
  logger.info('Report generation', {
    projectId,
    userId,
    status
  });
}

// Função para log de compartilhamento
export function logShare(reportId: string, sharedBy: string, sharedWith: string) {
  logger.info('Report shared', {
    reportId,
    sharedBy,
    sharedWith
  });
}

// Função para log de cache
export function logCache(operation: string, key: string, hit: boolean) {
  logger.debug('Cache operation', {
    operation,
    key,
    hit
  });
}

// Função para log de performance
export function logPerformance(operation: string, duration: number) {
  logger.debug('Performance', {
    operation,
    duration: `${duration}ms`
  });
} 