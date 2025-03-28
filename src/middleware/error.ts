import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Erro na aplicação', {
    error: err,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: 'error'
    });
  }

  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.message,
      status: 'error'
    });
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      status: 'error'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      status: 'error'
    });
  }

  // Erros de banco de dados
  if (err.name === 'PostgresError') {
    return res.status(500).json({
      error: 'Erro no banco de dados',
      status: 'error'
    });
  }

  // Erros de arquivo
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'Erro no upload de arquivo',
      details: err.message,
      status: 'error'
    });
  }

  // Erros de rate limit
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Muitas requisições',
      details: err.message,
      status: 'error'
    });
  }

  // Erros de cache
  if (err.name === 'RedisError') {
    return res.status(500).json({
      error: 'Erro no cache',
      status: 'error'
    });
  }

  // Erros de OCR
  if (err.name === 'OCRError') {
    return res.status(500).json({
      error: 'Erro no processamento de imagem',
      details: err.message,
      status: 'error'
    });
  }

  // Erros de email
  if (err.name === 'EmailError') {
    return res.status(500).json({
      error: 'Erro no envio de email',
      details: err.message,
      status: 'error'
    });
  }

  // Erros desconhecidos
  return res.status(500).json({
    error: 'Erro interno do servidor',
    status: 'error'
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.warn('Rota não encontrada', {
    path: req.path,
    method: req.method
  });

  res.status(404).json({
    error: 'Rota não encontrada',
    status: 'error'
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error.name === 'ValidationError') {
    return new AppError(400, error.message);
  }

  if (error.name === 'JsonWebTokenError') {
    return new AppError(401, 'Token inválido');
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError(401, 'Token expirado');
  }

  if (error.name === 'PostgresError') {
    return new AppError(500, 'Erro no banco de dados');
  }

  if (error.name === 'MulterError') {
    return new AppError(400, 'Erro no upload de arquivo');
  }

  if (error.name === 'RateLimitError') {
    return new AppError(429, 'Muitas requisições');
  }

  if (error.name === 'RedisError') {
    return new AppError(500, 'Erro no cache');
  }

  if (error.name === 'OCRError') {
    return new AppError(500, 'Erro no processamento de imagem');
  }

  if (error.name === 'EmailError') {
    return new AppError(500, 'Erro no envio de email');
  }

  return new AppError(500, 'Erro interno do servidor');
} 