import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Erro de validação do SQL Server
  if (err.name === 'RequestError' || err.name === 'TransactionError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro na operação com o banco de dados',
    });
  }

  // Erro de autenticação
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado',
    });
  }

  // Erro de upload de arquivo
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro no upload do arquivo',
    });
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  // Erro interno do servidor
  console.error('Erro:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
};

// Função para criar erros operacionais
export function createError(message: string, statusCode: number): AppError {
  return new AppError(message, statusCode);
}

// Função para verificar se é um erro operacional
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

// Função para tratar erros assíncronos
export function catchAsync(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
