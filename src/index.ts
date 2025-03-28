import './config/env';
import './lib/database';
import './lib/redis';
import './lib/email';
import './lib/jwt';
import './lib/logger';
import './lib/cache';
import './lib/upload';
import './lib/rateLimit';
import './lib/compression';
import './lib/monitoring';
import './lib/security';
import './lib/validation';
import './lib/error';
import './lib/auth';
import app from './app';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { globalLimiter } from './lib/rateLimit';
import { httpLogger, logger } from './lib/logger';
import { OCRService } from './lib/ocr';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import analysisRoutes from './routes/analysis';
import reportRoutes from './routes/reports';

// Carregar variáveis de ambiente
config();

const PORT = Number(process.env.PORT) || 5000;
logger.info(`Tentando iniciar servidor na porta ${PORT}`);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(globalLimiter);

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/reports', express.static(path.join(__dirname, '../reports')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);

// Rota de saúde
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tratamento de erros
app.use((err: any, _: express.Request, res: express.Response) => {
  logger.error('Erro não tratado', { error: err });
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicialização
async function startServer() {
  try {
    // Inicializar OCR
    const ocrService = OCRService.getInstance();
    await ocrService.initialize();
    logger.info('OCR inicializado com sucesso');

    // Tentar iniciar servidor em portas alternativas se necessário
    async function startServerOnPort(port: number): Promise<void> {
      try {
        await new Promise<void>((resolve, reject) => {
          const server = app.listen(port, () => {
            logger.info(`Servidor rodando na porta ${port}`);
            resolve();
          });

          server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
              logger.warn(`Porta ${port} em uso, tentando próxima porta...`);
              server.close();
              startServerOnPort(port + 1).catch(reject);
            } else {
              reject(error);
            }
          });
        });
      } catch (error) {
        logger.error('Erro ao iniciar servidor', { error });
        process.exit(1);
      }
    }

    await startServerOnPort(PORT);
  } catch (error) {
    logger.error('Erro ao iniciar servidor', { error });
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição de promessa não tratada', { reason, promise });
});

// Iniciar servidor
startServer(); 