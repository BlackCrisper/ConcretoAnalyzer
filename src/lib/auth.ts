import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_CONFIG } from '../config/env';
import { AppError } from './error';
import type { StringValue } from 'ms';

// Estender o tipo Request para incluir a propriedade user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Interface para o payload do token
interface TokenPayload {
  id: string;
  role: string;
}

// Classe para autenticação
class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Gerar hash de senha
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Verificar senha
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Gerar token de acesso
  public generateAccessToken = (payload: TokenPayload): string => {
    try {
      const options: SignOptions = {
        expiresIn: JWT_CONFIG.EXPIRES_IN as unknown as StringValue
      };
      return jwt.sign(payload, JWT_CONFIG.SECRET, options);
    } catch (error) {
      throw new AppError('Erro ao gerar token de acesso', 500);
    }
  };

  // Gerar token de refresh
  public generateRefreshToken = (payload: TokenPayload): string => {
    try {
      const options: SignOptions = {
        expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN as unknown as StringValue
      };
      return jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, options);
    } catch (error) {
      throw new AppError('Erro ao gerar token de refresh', 500);
    }
  };

  // Verificar token de acesso
  public verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_CONFIG.SECRET) as TokenPayload;
    } catch (error) {
      throw new AppError('Token de acesso inválido', 401);
    }
  }

  // Verificar token de refresh
  public verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_CONFIG.REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      throw new AppError('Token de refresh inválido', 401);
    }
  }

  // Gerar tokens de acesso e refresh
  public generateTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  // Renovar token de acesso usando refresh token
  public refreshAccessToken(refreshToken: string): string {
    const payload = this.verifyRefreshToken(refreshToken);
    return this.generateAccessToken(payload);
  }
}

// Middleware de autenticação
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('Token não fornecido', 401);
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }

    const auth = AuthService.getInstance();
    const decoded = auth.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware de autorização por role
export const authorize = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user as TokenPayload;
      if (!roles.includes(user.role)) {
        throw new AppError('Acesso não autorizado', 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware de autorização por ID
export const authorizeById = (paramName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user as TokenPayload;
      if (user.id !== req.params[paramName]) {
        throw new AppError('Acesso não autorizado', 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Exportar instância do serviço
export const auth = AuthService.getInstance(); 