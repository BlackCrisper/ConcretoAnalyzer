import express from 'express';
import {
  setupGlobalMiddlewares,
  setupAuthMiddlewares,
  setupValidationMiddlewares,
  setupAsyncMiddlewares
} from './middleware';
import { logger } from './lib/logger';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import analysisRoutes from './routes/analysis';
import reportRoutes from './routes/reports';

// Criação da aplicação Express
const app = express();

// Configuração dos middlewares
setupGlobalMiddlewares(app);
setupAuthMiddlewares(app);
setupValidationMiddlewares(app);
setupAsyncMiddlewares(app);

// Rota raiz
app.get('/', (_, res) => {
  res.json({
    message: 'API está funcionando!',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);

// Rota de saúde
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promessa rejeitada não tratada', { reason, promise });
  process.exit(1);
});

export default app; 