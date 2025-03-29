import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './lib/logger';
import {
  authMiddleware,
  validateRequest,
  errorHandler,
  monitoringMiddleware,
  rateLimiter,
} from './middleware';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import analysisRoutes from './routes/analysis';
import reportRoutes from './routes/reports';

// Criação da aplicação Express
const app = express();

// Configuração dos middlewares
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(monitoringMiddleware);
app.use(rateLimiter);
app.use(validateRequest);

// Rota raiz
app.get('/', (_, res) => {
  res.json({
    message: 'API está funcionando!',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware as express.RequestHandler, projectRoutes);
app.use('/api/files', authMiddleware as express.RequestHandler, fileRoutes);
app.use('/api/analysis', authMiddleware as express.RequestHandler, analysisRoutes);
app.use('/api/reports', authMiddleware as express.RequestHandler, reportRoutes);

// Rota de saúde
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Middleware de erro
app.use(errorHandler);

// Tratamento de erros não capturados
process.on('uncaughtException', error => {
  logger.error('Erro não capturado', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promessa rejeitada não tratada', { reason, promise });
  process.exit(1);
});

export default app;
