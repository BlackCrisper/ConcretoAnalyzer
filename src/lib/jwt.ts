import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/env';
import { logger } from './logger';

export class JWTService {
  private static instance: JWTService;
  private secret: string;
  private accessExpiresIn: string;
  private refreshExpiresIn: string;

  private constructor() {
    this.secret = JWT_CONFIG.SECRET;
    this.accessExpiresIn = JWT_CONFIG.EXPIRES_IN;
    this.refreshExpiresIn = JWT_CONFIG.REFRESH_EXPIRES_IN;
  }

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  public generateAccessToken(payload: any): string {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.accessExpiresIn
      } as jwt.SignOptions);
      logger.debug('Token de acesso gerado', {
        userId: payload.id,
        expiresIn: this.accessExpiresIn
      });
      return token;
    } catch (error) {
      logger.error('Erro ao gerar token de acesso', {
        error,
        payload
      });
      throw error;
    }
  }

  public generateRefreshToken(payload: any): string {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.refreshExpiresIn
      } as jwt.SignOptions);
      logger.debug('Token de atualização gerado', {
        userId: payload.id,
        expiresIn: this.refreshExpiresIn
      });
      return token;
    } catch (error) {
      logger.error('Erro ao gerar token de atualização', {
        error,
        payload
      });
      throw error;
    }
  }

  public verifyToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.secret);
      logger.debug('Token verificado', {
        userId: (decoded as any).id
      });
      return decoded;
    } catch (error) {
      logger.error('Erro ao verificar token', {
        error,
        token
      });
      throw error;
    }
  }

  public decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Erro ao decodificar token', {
        error,
        token
      });
      throw error;
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decoded.exp);
      return expirationDate < new Date();
    } catch (error) {
      logger.error('Erro ao verificar expiração do token', {
        error,
        token
      });
      return true;
    }
  }

  public getTokenFromHeader(header: string): string | null {
    try {
      if (!header || !header.startsWith('Bearer ')) {
        return null;
      }
      return header.split(' ')[1];
    } catch (error) {
      logger.error('Erro ao extrair token do header', {
        error,
        header
      });
      return null;
    }
  }

  public generateTokens(payload: any): { accessToken: string; refreshToken: string } {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);
      logger.debug('Tokens gerados', {
        userId: payload.id,
        accessExpiresIn: this.accessExpiresIn,
        refreshExpiresIn: this.refreshExpiresIn
      });
      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Erro ao gerar tokens', {
        error,
        payload
      });
      throw error;
    }
  }

  public async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.verifyToken(refreshToken);
      const { id, ...rest } = decoded;
      return this.generateTokens({ id, ...rest });
    } catch (error) {
      logger.error('Erro ao atualizar tokens', {
        error,
        refreshToken
      });
      throw error;
    }
  }
} 