import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from '../lib/logger';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Executar todas as validações
      await Promise.all(validations.map(validation => validation.run(req)));

      // Verificar resultados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Erro de validação', {
          errors: errors.array(),
          path: req.path,
          method: req.method
        });
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      logger.debug('Validação bem sucedida', {
        path: req.path,
        method: req.method
      });
      return next();
    } catch (error) {
      logger.error('Erro na validação', {
        error,
        path: req.path,
        method: req.method
      });
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  };
}

export function sanitize(sanitizations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Executar todas as sanitizações
      await Promise.all(sanitizations.map(sanitization => sanitization.run(req)));

      logger.debug('Sanitização concluída', {
        path: req.path,
        method: req.method
      });
      return next();
    } catch (error) {
      logger.error('Erro na sanitização', {
        error,
        path: req.path,
        method: req.method
      });
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  };
}

export function validateFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      logger.warn('Arquivo não fornecido', {
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Arquivo não fornecido'
      });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      logger.warn('Tipo de arquivo não permitido', {
        mimetype: req.file.mimetype,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Tipo de arquivo não permitido'
      });
    }

    // Validar tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      logger.warn('Arquivo muito grande', {
        size: req.file.size,
        maxSize,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Arquivo muito grande'
      });
    }

    return next();
  } catch (error) {
    logger.error('Erro na validação do arquivo', {
      error,
      path: req.path,
      method: req.method
    });
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

export function validatePagination(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1) {
      logger.warn('Página inválida', {
        page,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Página inválida'
      });
    }

    if (limit < 1 || limit > 100) {
      logger.warn('Limite inválido', {
        limit,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Limite inválido'
      });
    }

    // Adicionar valores validados à requisição
    req.query.page = page.toString();
    req.query.limit = limit.toString();

    return next();
  } catch (error) {
    logger.error('Erro na validação da paginação', {
      error,
      path: req.path,
      method: req.method
    });
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}

export function validateSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string;
    const minLength = 3;

    if (!query || query.length < minLength) {
      logger.warn('Termo de busca inválido', {
        query,
        minLength,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Termo de busca inválido'
      });
    }

    // Sanitizar termo de busca
    req.query.q = query.trim().toLowerCase();

    return next();
  } catch (error) {
    logger.error('Erro na validação da busca', {
      error,
      path: req.path,
      method: req.method
    });
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
} 