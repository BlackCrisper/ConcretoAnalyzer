import express from 'express';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  sanitizeMiddleware,
  securityHeadersMiddleware,
  ipValidationMiddleware,
  userAgentValidationMiddleware
} from './security';

import {
  cacheMiddleware,
  routeCacheMiddleware,
  queryCacheMiddleware,
  partialCacheMiddleware,
  conditionalCacheMiddleware
} from './cache';

import {
  compressionMiddleware,
  typeCompressionMiddleware,
  sizeCompressionMiddleware,
  routeCompressionMiddleware,
  methodCompressionMiddleware,
  errorCompressionMiddleware,
  successCompressionMiddleware,
  jsonCompressionMiddleware,
  htmlCompressionMiddleware,
  cssCompressionMiddleware,
  jsCompressionMiddleware
} from './compression';

import {
  monitoringMiddleware,
  errorMonitoringMiddleware,
  performanceMonitoringMiddleware,
  resourceMonitoringMiddleware,
  securityMonitoringMiddleware
} from './monitoring';

import {
  authenticate,
  authorize,
  validateRefreshToken,
  validatePasswordResetToken,
  validateEmailVerificationToken,
  validateInviteToken
} from './auth';

import { errorHandler, notFoundHandler, asyncHandler } from './error';
import { validate } from './validation';

// Configuração dos middlewares globais
export function setupGlobalMiddlewares(app: express.Application) {
  // Segurança
  app.use(corsMiddleware);
  app.use(helmetMiddleware);
  app.use(rateLimitMiddleware);
  app.use(sanitizeMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(ipValidationMiddleware);
  app.use(userAgentValidationMiddleware);

  // Cache
  app.use(cacheMiddleware);
  app.use(routeCacheMiddleware);
  app.use(queryCacheMiddleware);
  app.use(partialCacheMiddleware);
  app.use(conditionalCacheMiddleware);

  // Compressão
  app.use(compressionMiddleware);
  app.use(typeCompressionMiddleware(['text/html', 'application/json', 'text/css', 'application/javascript']));
  app.use(sizeCompressionMiddleware(1024, 10485760)); // Entre 1KB e 10MB
  app.use(routeCompressionMiddleware(['/api']));
  app.use(methodCompressionMiddleware(['GET', 'POST']));
  app.use(errorCompressionMiddleware);
  app.use(successCompressionMiddleware);
  app.use(jsonCompressionMiddleware);
  app.use(htmlCompressionMiddleware);
  app.use(cssCompressionMiddleware);
  app.use(jsCompressionMiddleware);

  // Monitoramento
  app.use(monitoringMiddleware);
  app.use(errorMonitoringMiddleware);
  app.use(performanceMonitoringMiddleware);
  app.use(resourceMonitoringMiddleware);
  app.use(securityMonitoringMiddleware);

  // Tratamento de erros
  app.use(errorHandler);
  app.use(notFoundHandler);
}

// Configuração dos middlewares de autenticação
export function setupAuthMiddlewares(app: express.Application) {
  // Rotas públicas
  app.post('/auth/refresh', validateRefreshToken as express.RequestHandler);
  app.post('/auth/reset-password/:token', validatePasswordResetToken as express.RequestHandler);
  app.get('/auth/verify-email/:token', validateEmailVerificationToken as express.RequestHandler);
  app.get('/auth/invite/:token', validateInviteToken as express.RequestHandler);

  // Rotas protegidas
  app.use('/api', authenticate as express.RequestHandler);
  app.use('/api/admin', authorize(['admin']) as express.RequestHandler);
  app.use('/api/user', authorize(['user', 'admin']) as express.RequestHandler);
}

// Configuração dos middlewares de validação
export function setupValidationMiddlewares(app: express.Application) {
  app.use(validate([]));
}

// Configuração dos middlewares assíncronos
export function setupAsyncMiddlewares(app: express.Application) {
  app.use(asyncHandler);
}

// Exportação dos middlewares individuais
export {
  // Segurança
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  sanitizeMiddleware,
  securityHeadersMiddleware,
  ipValidationMiddleware,
  userAgentValidationMiddleware,

  // Cache
  cacheMiddleware,
  routeCacheMiddleware,
  queryCacheMiddleware,
  partialCacheMiddleware,
  conditionalCacheMiddleware,

  // Compressão
  compressionMiddleware,
  typeCompressionMiddleware,
  sizeCompressionMiddleware,
  routeCompressionMiddleware,
  methodCompressionMiddleware,
  errorCompressionMiddleware,
  successCompressionMiddleware,
  jsonCompressionMiddleware,
  htmlCompressionMiddleware,
  cssCompressionMiddleware,
  jsCompressionMiddleware,

  // Monitoramento
  monitoringMiddleware,
  errorMonitoringMiddleware,
  performanceMonitoringMiddleware,
  resourceMonitoringMiddleware,
  securityMonitoringMiddleware,

  // Autenticação
  authenticate,
  authorize,
  validateRefreshToken,
  validatePasswordResetToken,
  validateEmailVerificationToken,
  validateInviteToken,

  // Erro
  errorHandler,
  notFoundHandler,
  asyncHandler,

  // Validação
  validate
}; 