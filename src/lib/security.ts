import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logger';

// Configuração do CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 horas
};

// Configuração do Helmet
const helmetOptions = {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  dnsPrefetchControl: false,
  frameguard: false,
  hidePoweredBy: true,
  hsts: false,
  ieNoOpen: false,
  noSniff: true,
  referrerPolicy: false,
  xssFilter: true,
};

// Middleware CORS
export const corsMiddleware = cors(corsOptions);

// Middleware Helmet
export const helmetMiddleware = helmet(helmetOptions);

// Middleware para validação de IP
export const ipValidationMiddleware = (req: any, res: any, next: any) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const blockedIps = process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [];

  if (blockedIps.includes(clientIp)) {
    logger.warn('Acesso bloqueado por IP', { ip: clientIp });
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};

// Middleware para validação de User-Agent
export const userAgentValidationMiddleware = (req: any, res: any, next: any) => {
  const userAgent = req.get('user-agent');
  const blockedAgents = process.env.BLOCKED_USER_AGENTS
    ? process.env.BLOCKED_USER_AGENTS.split(',')
    : [];

  if (
    !userAgent ||
    blockedAgents.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()))
  ) {
    logger.warn('Acesso bloqueado por User-Agent', { userAgent });
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};

// Middleware para sanitização de dados
export const sanitizeMiddleware = (req: any, _: any, next: any) => {
  // Sanitizar query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/[<>]/g, '');
      }
    });
  }

  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>]/g, '');
      }
    });
  }

  // Sanitizar params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].replace(/[<>]/g, '');
      }
    });
  }

  next();
};

// Middleware para headers de segurança
export const securityHeadersMiddleware = (_: any, res: any, next: any) => {
  // Remover headers sensíveis
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Adicionar headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'");

  next();
};

// Exportar todos os middlewares de segurança
export const securityMiddlewares = [
  corsMiddleware,
  helmetMiddleware,
  ipValidationMiddleware,
  userAgentValidationMiddleware,
  sanitizeMiddleware,
  securityHeadersMiddleware,
];
