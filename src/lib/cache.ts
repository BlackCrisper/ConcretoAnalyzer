import { RedisService } from './redis';
import { CACHE_CONFIG, REDIS_CONFIG } from '../config/env';
import { logger } from './logger';

export class CacheService {
  private static instance: CacheService;
  private redis: RedisService;
  private prefix: string;

  private constructor() {
    this.redis = RedisService.getInstance();
    this.prefix = REDIS_CONFIG.KEY_PREFIX;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Erro ao obter valor do cache', {
        error,
        key,
      });
      return null;
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.set(this.getKey(key), serializedValue, ttl || CACHE_CONFIG.TTL);
      logger.debug('Valor armazenado no cache', {
        key,
        ttl: ttl || CACHE_CONFIG.TTL,
      });
    } catch (error) {
      logger.error('Erro ao armazenar valor no cache', {
        error,
        key,
      });
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
      logger.debug('Valor removido do cache', { key });
    } catch (error) {
      logger.error('Erro ao remover valor do cache', {
        error,
        key,
      });
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      return await this.redis.exists(this.getKey(key));
    } catch (error) {
      logger.error('Erro ao verificar existência no cache', {
        error,
        key,
      });
      return false;
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(this.getKey(key));
    } catch (error) {
      logger.error('Erro ao incrementar valor no cache', {
        error,
        key,
      });
      return 0;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(this.getKey(key), ttl);
      logger.debug('TTL definido no cache', {
        key,
        ttl,
      });
    } catch (error) {
      logger.error('Erro ao definir TTL no cache', {
        error,
        key,
        ttl,
      });
    }
  }

  public async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      logger.info('Cache limpo');
    } catch (error) {
      logger.error('Erro ao limpar cache', { error });
    }
  }

  public async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        logger.debug('Valor obtido do cache', { key });
        return cached;
      }

      const value = await fn();
      await this.set(key, value, ttl);
      logger.debug('Valor obtido da função e armazenado no cache', {
        key,
        ttl: ttl || CACHE_CONFIG.TTL,
      });
      return value;
    } catch (error) {
      logger.error('Erro ao obter ou definir valor no cache', {
        error,
        key,
      });
      return fn();
    }
  }

  public async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      logger.info('Cache invalidado por padrão', { pattern });
    } catch (error) {
      logger.error('Erro ao invalidar cache por padrão', {
        error,
        pattern,
      });
    }
  }
}
