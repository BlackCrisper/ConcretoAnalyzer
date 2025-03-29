import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { logger } from './logger';
import { errorHandler } from '../middleware/error';
import { monitoringMiddleware } from '../middleware/monitoring';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';

const app = express();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(monitoringMiddleware);
app.use(rateLimiter);
app.use(validateRequest);

// Rotas
app.use('/api/auth', require('../app/api/auth/route'));
app.use('/api/users', authMiddleware as express.RequestHandler, require('../app/api/users/route'));
app.use('/api/companies', authMiddleware as express.RequestHandler, require('../app/api/companies/route'));
app.use('/api/branches', authMiddleware as express.RequestHandler, require('../app/api/branches/route'));
app.use('/api/structural-analysis', authMiddleware as express.RequestHandler, require('../app/api/structural-analysis/route'));
app.use('/api/reports', authMiddleware as express.RequestHandler, require('../app/api/reports/route'));
app.use('/api/files', authMiddleware as express.RequestHandler, require('../app/api/files/route'));
app.use('/api/invitations', authMiddleware as express.RequestHandler, require('../app/api/invitations/route'));
app.use('/api/notifications', authMiddleware as express.RequestHandler, require('../app/api/notifications/route'));

// Rota de upload
app.use('/api/upload', upload.single('file'));

// Middleware de erro
app.use(errorHandler);

export default app;

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