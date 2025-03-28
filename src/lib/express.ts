import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import { errorHandler } from '../middleware/errorHandler';
import { notFoundHandler } from '../middleware/notFoundHandler';
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { validateRequest } from '../middleware/validateRequest';
import { upload } from './multer';

// Importar rotas
import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import projectRoutes from '../routes/projects';
import fileRoutes from '../routes/files';
import analysisRoutes from '../routes/analysis';
import reportRoutes from '../routes/reports';

export function createApp() {
  const app = express();

  // Middleware básico
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(morgan('dev'));
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // Rotas públicas
  app.use('/api/auth', authRoutes);

  // Middleware de autenticação para rotas protegidas
  app.use('/api', authenticateToken);

  // Rotas protegidas
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/reports', reportRoutes);

  // Middleware de validação
  app.use(validateRequest);

  // Middleware de upload de arquivos
  app.use('/api/upload', upload.single('file'));

  // Middleware de tratamento de erros
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Função para iniciar o servidor
export function startServer(app: express.Application, port: number) {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

// Função para encerrar o servidor
export function stopServer(server: any) {
  server.close(() => {
    console.log('Servidor encerrado');
  });
}

// Função para configurar o servidor
export function configureServer(app: express.Application) {
  // Configurar timeout
  app.use((req, res, next) => {
    res.setTimeout(300000); // 5 minutos
    next();
  });

  // Configurar headers de segurança
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Configurar CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Configurar rate limiting
  app.use((req, res, next) => {
    // Implementar rate limiting aqui
    next();
  });
} 