import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from '../lib/logger';

// Configuração do CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 horas
};

// Configuração do Helmet
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  dnsPrefetchControl: false,
  frameguard: false,
  hidePoweredBy: true,
  hsts: false,
  ieNoOpen: false,
  noSniff: true,
  originAgentCluster: false,
  permittedCrossDomainPolicies: false,
  referrerPolicy: false,
  xssFilter: true,
};

// Middleware de CORS
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  return cors(corsOptions)(req, res, err => {
    if (err) {
      logger.error('Erro no CORS', {
        error: err,
        origin: req.headers.origin,
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({
        error: 'Acesso não permitido',
        status: 'error',
      });
    }
    return next();
  });
}

// Middleware de Helmet
export function helmetMiddleware(_req: Request, res: Response, next: NextFunction) {
  return helmet(helmetOptions)(_req, res, next);
}

// Middleware de Rate Limit
export function rateLimitMiddleware(req: Request, _res: Response, next: NextFunction) {
  const ip = req.ip;
  const path = req.path;
  const method = req.method;

  logger.debug('Requisição recebida', {
    ip,
    path,
    method,
  });

  next();
}

// Middleware de Sanitização
export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction) {
  // Sanitizar query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].toString().trim();
      }
    });
  }

  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitizar params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].trim();
      }
    });
  }

  next();
}

// Middleware de Headers de Segurança
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
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
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}

// Middleware de Validação de IP
export function ipValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;
  const blockedIPs = process.env.BLOCKED_IPS?.split(',') || [];

  if (ip && blockedIPs.includes(ip)) {
    logger.warn('IP bloqueado', {
      ip,
      path: req.path,
      method: req.method,
    });
    return res.status(403).json({
      error: 'IP bloqueado',
      status: 'error',
    });
  }

  return next();
}

// Middleware de Validação de User Agent
export function userAgentValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers['user-agent'];
  const blockedUserAgents = process.env.BLOCKED_USER_AGENTS?.split(',') || [];

  if (userAgent && blockedUserAgents.some(blocked => userAgent.includes(blocked))) {
    logger.warn('User Agent bloqueado', {
      userAgent,
      path: req.path,
      method: req.method,
    });
    return res.status(403).json({
      error: 'User Agent bloqueado',
      status: 'error',
    });
  }

  return next();
}
