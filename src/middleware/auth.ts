import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis';
import { JWT_CONFIG } from '../config/env';
import { logger } from '../lib/logger';
import { AppError } from '../lib/error';

// Interface para estender o Request do Express
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

// Interface para payload do token
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Função para gerar token JWT
export function generateToken(id: string, role: string): string {
  return jwt.sign(
    { id, role },
    JWT_CONFIG.SECRET,
    { expiresIn: '1d' }
  );
}

// Função para gerar token de refresh
export function generateRefreshToken(id: string, role: string): string {
  return jwt.sign(
    { id, role },
    JWT_CONFIG.REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware de autenticação
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;

    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware de autorização por role
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Não autorizado'
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Acesso negado'
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

// Middleware para verificar propriedade do recurso
export const checkOwnership = (resourceId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Não autorizado'
        });
      }

      if (user.role !== 'admin' && user.id !== resourceId) {
        return res.status(403).json({
          status: 'error',
          message: 'Acesso negado'
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

// Função para verificar expiração do token
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded.exp) return false;
    return decoded.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

// Middleware para validar token de refresh
export const validateRefreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Token de refresh não fornecido', 401);
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      throw new AppError('Token de refresh inválido', 401);
    }

    // Verificar token
    const decoded = jwt.verify(refreshToken, JWT_CONFIG.REFRESH_SECRET) as TokenPayload;

    // Adicionar usuário à requisição
    req.user = decoded;

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Erro de autenticação', { error });
      return res.status(401).json({
        status: 'error',
        message: 'Token de refresh inválido'
      });
    }

    return next(error);
  }
};

// Middleware para validar token de reset de senha
export const validatePasswordResetToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      logger.warn('Tentativa de reset sem token', {
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Token de reset não fornecido'
      });
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      logger.warn('Token de reset na lista negra', {
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (isTokenExpired(token)) {
      logger.warn('Token de reset expirado', {
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: 'Token de reset expirado'
      });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as TokenPayload;

    // Adicionar usuário à requisição
    req.user = decoded;

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Erro de autenticação', { error });
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    return next(error);
  }
};

// Middleware para validar token de verificação de email
export const validateEmailVerificationToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      logger.warn('Tentativa de verificação sem token', {
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Token de verificação não fornecido'
      });
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      logger.warn('Token de verificação na lista negra', {
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (isTokenExpired(token)) {
      logger.warn('Token de verificação expirado', {
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: 'Token de verificação expirado'
      });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as TokenPayload;

    // Adicionar usuário à requisição
    req.user = decoded;

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Erro de autenticação', { error });
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    return next(error);
  }
};

// Middleware para validar token de convite
export const validateInviteToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      logger.warn('Tentativa de convite sem token', {
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        error: 'Token de convite não fornecido'
      });
    }

    // Verificar se o token está na blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      logger.warn('Token de convite na lista negra', {
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (isTokenExpired(token)) {
      logger.warn('Token de convite expirado', {
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: 'Token de convite expirado'
      });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as TokenPayload;
    req.user = decoded;
    logger.debug('Token de convite válido', {
      inviteId: decoded.id,
      path: req.path,
      method: req.method
    });
    return next();
  } catch (error) {
    logger.error('Erro na validação do token de convite', {
      error,
      path: req.path,
      method: req.method
    });
    return res.status(401).json({
      error: 'Token de convite inválido'
    });
  }
}; 