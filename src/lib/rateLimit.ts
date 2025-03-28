import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIG } from '../config/env';
import { logger } from './logger';

// Configurar rate limiter global
export const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Muitas requisições deste IP, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para autenticação
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
  message: 'Muitas tentativas de login, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Muitas tentativas de login, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para upload de arquivos
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads
  message: 'Limite de uploads excedido, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Limite de uploads excedido, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para análise estrutural
export const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 análises
  message: 'Limite de análises excedido, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Analysis rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Limite de análises excedido, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para geração de relatórios
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 relatórios
  message: 'Limite de geração de relatórios excedido, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Report generation rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Limite de geração de relatórios excedido, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para API
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições
  message: 'Limite de requisições à API excedido, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Limite de requisições à API excedido, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para download
export const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 downloads
  message: 'Limite de downloads excedido, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Download rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Limite de downloads excedido, tente novamente mais tarde.'
    });
  }
});

// Configurar rate limiter para compartilhamento
export const shareLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 compartilhamentos
  message: 'Limite de compartilhamentos excedido, tente novamente mais tarde.',
  handler: (req, res) => {
    logger.warn('Share rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Limite de compartilhamentos excedido, tente novamente mais tarde.'
    });
  }
}); 