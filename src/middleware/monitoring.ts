import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

// Interface para métricas
interface Metrics {
  timestamp: number;
  path: string;
  method: string;
  duration: number;
  statusCode: number;
  ip: string | undefined;
  userAgent: string;
  requestSize: number;
  responseSize: number;
}

// Armazenamento de métricas
const metrics: Metrics[] = [];

// Limite de métricas armazenadas
const MAX_METRICS = 1000;

// Função auxiliar para substituir res.end
function createEndHandler(
  originalEnd: any,
  req: Request,
  start: number,
  requestSize: number,
  additionalMetrics?: (duration: number) => void
) {
  return function (
    this: Response,
    chunk: any,
    encoding?: BufferEncoding | (() => void),
    cb?: () => void
  ) {
    const duration = Date.now() - start;
    const contentLength = this.getHeader('content-length');
    const responseSize = typeof contentLength === 'string' ? parseInt(contentLength) : 0;

    // Coletar métricas
    const metric: Metrics = {
      timestamp: Date.now(),
      path: req.path,
      method: req.method,
      duration,
      statusCode: this.statusCode,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      requestSize,
      responseSize,
    };

    // Armazenar métricas
    metrics.push(metric);
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    // Log de métricas
    logger.debug('Métricas coletadas', {
      ...metric,
      path: req.path,
      method: req.method,
    });

    // Executar métricas adicionais se fornecidas
    if (additionalMetrics) {
      additionalMetrics(duration);
    }

    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = undefined;
    }

    return originalEnd.call(this, chunk, encoding as BufferEncoding, cb);
  };
}

// Middleware de monitoramento
export function monitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestSize = parseInt(req.headers['content-length'] || '0');

  // Interceptar resposta
  const originalEnd = res.end;
  res.end = createEndHandler(originalEnd, req, start, requestSize);

  next();
}

// Middleware de monitoramento de erros
export function errorMonitoringMiddleware(
  err: Error,
  req: Request,
  _res: Response,
  next: NextFunction
) {
  logger.error('Erro na aplicação', {
    error: err,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: Date.now(),
  });

  next(err);
}

// Middleware de monitoramento de performance
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const startMemory = process.memoryUsage();
  const requestSize = parseInt(req.headers['content-length'] || '0');

  // Interceptar resposta
  const originalEnd = res.end;
  res.end = createEndHandler(originalEnd, req, start, requestSize, duration => {
    const endMemory = process.memoryUsage();

    // Calcular uso de memória
    const memoryUsage = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
      rss: endMemory.rss - startMemory.rss,
    };

    // Log de performance
    logger.debug('Performance coletada', {
      duration,
      memoryUsage,
      path: req.path,
      method: req.method,
    });
  });

  next();
}

// Middleware de monitoramento de recursos
export function resourceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const startCpu = process.cpuUsage();
  const requestSize = parseInt(req.headers['content-length'] || '0');

  // Interceptar resposta
  const originalEnd = res.end;
  res.end = createEndHandler(originalEnd, req, start, requestSize, duration => {
    const endCpu = process.cpuUsage(startCpu);

    // Log de recursos
    logger.debug('Recursos coletados', {
      duration,
      cpuUsage: endCpu,
      path: req.path,
      method: req.method,
    });
  });

  next();
}

// Middleware de monitoramento de segurança
export function securityMonitoringMiddleware(req: Request, _res: Response, next: NextFunction) {
  // Verificar headers suspeitos
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded',
    'x-forwarded-proto',
  ];

  const suspiciousHeaderFound = Object.keys(req.headers).some(header =>
    suspiciousHeaders.includes(header.toLowerCase())
  );

  if (suspiciousHeaderFound) {
    logger.warn('Headers suspeitos detectados', {
      headers: req.headers,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  // Verificar payload suspeito
  const suspiciousPayload =
    req.body &&
    typeof req.body === 'object' &&
    Object.values(req.body).some(
      value =>
        typeof value === 'string' &&
        (value.includes('<script>') || value.includes('javascript:') || value.includes('onerror='))
    );

  if (suspiciousPayload) {
    logger.warn('Payload suspeito detectado', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  next();
}

// Função para obter métricas
export function getMetrics(): Metrics[] {
  return metrics;
}

// Função para limpar métricas
export function clearMetrics(): void {
  metrics.length = 0;
}

// Função para obter estatísticas
export function getStats(): {
  totalRequests: number;
  averageDuration: number;
  statusCodes: { [key: number]: number };
  methods: { [key: string]: number };
  paths: { [key: string]: number };
} {
  const stats = {
    totalRequests: metrics.length,
    averageDuration: 0,
    statusCodes: {} as { [key: number]: number },
    methods: {} as { [key: string]: number },
    paths: {} as { [key: string]: number },
  };

  if (metrics.length === 0) {
    return stats;
  }

  let totalDuration = 0;

  metrics.forEach(metric => {
    totalDuration += metric.duration;

    // Contar códigos de status
    stats.statusCodes[metric.statusCode] = (stats.statusCodes[metric.statusCode] || 0) + 1;

    // Contar métodos
    stats.methods[metric.method] = (stats.methods[metric.method] || 0) + 1;

    // Contar paths
    stats.paths[metric.path] = (stats.paths[metric.path] || 0) + 1;
  });

  stats.averageDuration = totalDuration / metrics.length;

  return stats;
}
