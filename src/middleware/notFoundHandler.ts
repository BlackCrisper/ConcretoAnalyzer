import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = createError(`Rota ${req.originalUrl} não encontrada`, 404);
  next(error);
}; 