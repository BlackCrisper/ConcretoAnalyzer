import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Classe de erro personalizada
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware para tratamento de erros
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Erro personalizado
  if (err instanceof AppError) {
    logger.error('Erro operacional', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack
    });

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    logger.error('Erro de validação', {
      message: err.message,
      stack: err.stack
    });

    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: err.message
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.error('Erro de autenticação', {
      message: err.message,
      stack: err.stack
    });

    return res.status(401).json({
      status: 'error',
      message: 'Erro de autenticação'
    });
  }

  // Erro de banco de dados
  if (err.name === 'SequelizeError' || err.name === 'MongoError') {
    logger.error('Erro de banco de dados', {
      message: err.message,
      stack: err.stack
    });

    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }

  // Erro de arquivo
  if (err.name === 'MulterError') {
    logger.error('Erro no upload de arquivo', {
      message: err.message,
      stack: err.stack
    });

    return res.status(400).json({
      status: 'error',
      message: 'Erro no upload de arquivo'
    });
  }

  // Erro de rate limit
  if (err.name === 'TooManyRequests') {
    logger.error('Muitas requisições', {
      message: err.message,
      stack: err.stack
    });

    return res.status(429).json({
      status: 'error',
      message: 'Muitas requisições'
    });
  }

  // Erro de cache
  if (err.name === 'CacheError') {
    logger.error('Erro de cache', {
      message: err.message,
      stack: err.stack
    });

    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }

  // Erro de OCR
  if (err.name === 'OCRError') {
    logger.error('Erro no processamento OCR', {
      message: err.message,
      stack: err.stack
    });

    return res.status(500).json({
      status: 'error',
      message: 'Erro no processamento de imagem'
    });
  }

  // Erro de email
  if (err.name === 'EmailError') {
    logger.error('Erro no envio de email', {
      message: err.message,
      stack: err.stack
    });

    return res.status(500).json({
      status: 'error',
      message: 'Erro no envio de email'
    });
  }

  // Erro não tratado
  logger.error('Erro não tratado', {
    message: err.message,
    stack: err.stack
  });

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
};

// Middleware para rotas não encontradas
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Rota não encontrada', {
    method: req.method,
    url: req.url
  });

  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada'
  });
};

// Wrapper para funções assíncronas
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Função para validar erro
export const validateError = (err: any): AppError => {
  if (err instanceof AppError) {
    return err;
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    return new AppError(err.message, 400);
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError('Erro de autenticação', 401);
  }

  // Erro de banco de dados
  if (err.name === 'SequelizeError' || err.name === 'MongoError') {
    return new AppError('Erro interno do servidor', 500);
  }

  // Erro de arquivo
  if (err.name === 'MulterError') {
    return new AppError('Erro no upload de arquivo', 400);
  }

  // Erro de rate limit
  if (err.name === 'TooManyRequests') {
    return new AppError('Muitas requisições', 429);
  }

  // Erro de cache
  if (err.name === 'CacheError') {
    return new AppError('Erro interno do servidor', 500);
  }

  // Erro de OCR
  if (err.name === 'OCRError') {
    return new AppError('Erro no processamento de imagem', 500);
  }

  // Erro de email
  if (err.name === 'EmailError') {
    return new AppError('Erro no envio de email', 500);
  }

  // Erro não tratado
  return new AppError('Erro interno do servidor', 500);
}; 