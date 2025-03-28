import Redis from 'ioredis';
import { REDIS_CONFIG } from '../config/env';
import { logger } from './logger';

export class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host: REDIS_CONFIG.HOST,
      port: REDIS_CONFIG.PORT,
      password: REDIS_CONFIG.PASSWORD,
      db: REDIS_CONFIG.DB,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      logger.info('Conectado ao Redis');
    });

    this.client.on('error', (error) => {
      logger.error('Erro na conexão com Redis', { error });
    });

    this.client.on('close', () => {
      logger.warn('Conexão com Redis fechada');
    });

    this.client.on('reconnecting', () => {
      logger.info('Reconectando ao Redis');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Erro ao obter valor do Redis', {
        error,
        key
      });
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      logger.debug('Valor armazenado no Redis', {
        key,
        ttl
      });
    } catch (error) {
      logger.error('Erro ao armazenar valor no Redis', {
        error,
        key
      });
    }
  }

  public async del(...keys: string[]): Promise<void> {
    try {
      await this.client.del(...keys);
      logger.debug('Valores removidos do Redis', { keys });
    } catch (error) {
      logger.error('Erro ao remover valores do Redis', {
        error,
        keys
      });
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Erro ao verificar existência no Redis', {
        error,
        key
      });
      return false;
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Erro ao incrementar valor no Redis', {
        error,
        key
      });
      return 0;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
      logger.debug('TTL definido no Redis', {
        key,
        ttl
      });
    } catch (error) {
      logger.error('Erro ao definir TTL no Redis', {
        error,
        key,
        ttl
      });
    }
  }

  public async flushdb(): Promise<void> {
    try {
      await this.client.flushdb();
      logger.info('Banco de dados Redis limpo');
    } catch (error) {
      logger.error('Erro ao limpar banco de dados Redis', { error });
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Erro ao buscar chaves no Redis', {
        error,
        pattern
      });
      return [];
    }
  }

  public async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Erro ao verificar conexão com Redis', { error });
      return false;
    }
  }

  public async quit(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Conexão com Redis encerrada');
    } catch (error) {
      logger.error('Erro ao encerrar conexão com Redis', { error });
    }
  }
}

export const redis = RedisService.getInstance(); 