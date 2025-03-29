import { logger } from './logger';

// Interface para métricas
interface Metrics {
  requestCount: number;
  errorCount: number;
  responseTime: number[];
  memoryUsage: number[];
  cpuUsage: number[];
  activeConnections: number;
  lastError?: Error;
}

// Classe para monitoramento
class MonitoringService {
  private static instance: MonitoringService;
  private metrics: Metrics;
  private startTime: number;
  private metricsInterval: NodeJS.Timeout | null;

  private constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      activeConnections: 0,
    };
    this.startTime = Date.now();
    this.metricsInterval = null;
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Iniciar coleta de métricas
  public startMetricsCollection(interval = 60000): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, interval);

    logger.info('Coleta de métricas iniciada', { interval });
  }

  // Parar coleta de métricas
  public stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      logger.info('Coleta de métricas parada');
    }
  }

  // Coletar métricas
  private collectMetrics(): void {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cpuUsage = process.cpuUsage().user / 1000000; // segundos

    this.metrics.memoryUsage.push(memoryUsage);
    this.metrics.cpuUsage.push(cpuUsage);

    // Manter apenas as últimas 60 amostras
    if (this.metrics.memoryUsage.length > 60) {
      this.metrics.memoryUsage.shift();
    }
    if (this.metrics.cpuUsage.length > 60) {
      this.metrics.cpuUsage.shift();
    }

    logger.debug('Métricas coletadas', {
      memoryUsage,
      cpuUsage,
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      activeConnections: this.metrics.activeConnections,
    });
  }

  // Registrar início de requisição
  public trackRequest(): void {
    this.metrics.requestCount++;
    this.metrics.activeConnections++;
  }

  // Registrar fim de requisição
  public trackResponse(duration: number): void {
    this.metrics.activeConnections--;
    this.metrics.responseTime.push(duration);

    // Manter apenas as últimas 1000 amostras
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  // Registrar erro
  public trackError(error: Error): void {
    this.metrics.errorCount++;
    this.metrics.lastError = error;
    logger.error('Erro registrado', { error });
  }

  // Obter métricas
  public getMetrics(): Metrics & { uptime: number } {
    const uptime = Date.now() - this.startTime;
    return {
      ...this.metrics,
      uptime,
    };
  }

  // Obter tempo médio de resposta
  public getAverageResponseTime(): number {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTime.length;
  }

  // Obter taxa de erro
  public getErrorRate(): number {
    if (this.metrics.requestCount === 0) return 0;
    return this.metrics.errorCount / this.metrics.requestCount;
  }

  // Resetar métricas
  public resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      activeConnections: 0,
    };
    logger.info('Métricas resetadas');
  }
}

// Middleware para monitoramento
export const monitoringMiddleware = (_: any, res: any, next: any) => {
  const monitoring = MonitoringService.getInstance();
  const start = Date.now();
  monitoring.trackRequest();

  res.on('finish', () => {
    const duration = Date.now() - start;
    monitoring.trackResponse(duration);

    if (res.statusCode >= 400) {
      monitoring.trackError(new Error(`HTTP ${res.statusCode}`));
    }
  });

  next();
};

// Exportar instância do serviço
export const monitoring = MonitoringService.getInstance();
