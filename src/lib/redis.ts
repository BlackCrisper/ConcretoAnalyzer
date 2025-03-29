import Redis from 'ioredis';
import { REDIS_CONFIG } from '../config/env';
import { logger } from './logger';

class MockRedisClient {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async del(...keys: string[]): Promise<void> {
    keys.forEach(key => this.store.delete(key));
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async incr(key: string): Promise<number> {
    const value = Number(this.store.get(key) || '0');
    this.store.set(key, String(value + 1));
    return value + 1;
  }

  async expire(): Promise<void> {
    // Mock implementation
  }

  async flushdb(): Promise<void> {
    this.store.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    return Array.from(this.store.keys()).filter(key => key.includes(pattern));
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async quit(): Promise<void> {
    // Mock implementation
  }
}

export class RedisService {
  private static instance: RedisService;
  private client: Redis | MockRedisClient;

  private constructor() {
    try {
      this.client = new Redis({
        host: REDIS_CONFIG.HOST,
        port: REDIS_CONFIG.PORT,
        password: REDIS_CONFIG.PASSWORD,
        db: REDIS_CONFIG.DB,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.setupEventListeners();
    } catch (error) {
      logger.warn('Não foi possível conectar ao Redis, usando implementação mock', { error });
      this.client = new MockRedisClient();
    }
  }

  private setupEventListeners(): void {
    if (this.client instanceof Redis) {
      this.client.on('connect', () => {
        logger.info('Conectado ao Redis');
      });

      this.client.on('error', error => {
        logger.error('Erro na conexão com Redis', { error });
      });

      this.client.on('close', () => {
        logger.warn('Conexão com Redis fechada');
      });

      this.client.on('reconnecting', () => {
        logger.info('Reconectando ao Redis');
      });
    }
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
        key,
      });
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl && this.client instanceof Redis) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      logger.debug('Valor armazenado no Redis', {
        key,
        ttl,
      });
    } catch (error) {
      logger.error('Erro ao armazenar valor no Redis', {
        error,
        key,
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
        keys,
      });
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (this.client instanceof Redis) {
        const result = await this.client.exists(key);
        return result === 1;
      }
      return this.client.exists(key);
    } catch (error) {
      logger.error('Erro ao verificar existência no Redis', {
        error,
        key,
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
        key,
      });
      return 0;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      if (this.client instanceof Redis) {
        await this.client.expire(key, ttl);
        logger.debug('TTL definido no Redis', {
          key,
          ttl,
        });
      }
    } catch (error) {
      logger.error('Erro ao definir TTL no Redis', {
        error,
        key,
        ttl,
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
        pattern,
      });
      return [];
    }
  }

  public async ping(): Promise<boolean> {
    try {
      if (this.client instanceof Redis) {
        const result = await this.client.ping();
        return result === 'PONG';
      }
      return true;
    } catch (error) {
      logger.error('Erro ao verificar conexão com Redis', { error });
      return false;
    }
  }

  public async quit(): Promise<void> {
    try {
      if (this.client instanceof Redis) {
        await this.client.quit();
        logger.info('Conexão com Redis encerrada');
      }
    } catch (error) {
      logger.error('Erro ao encerrar conexão com Redis', { error });
    }
  }
}

export const redis = RedisService.getInstance();
