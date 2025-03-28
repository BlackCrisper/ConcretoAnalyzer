import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../lib/cache';
import { logger } from '../lib/logger';

const cacheService = CacheService.getInstance();

// Interface para os dados do cache
interface CacheData {
  data: any;
  etag: string;
  timestamp: number;
}

// Middleware de cache para GET
export function cacheMiddleware(ttl: number = 3600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apenas para requisições GET
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        logger.debug('Dados obtidos do cache', {
          key,
          path: req.path,
          method: req.method
        });
        return res.json(cachedData);
      }

      // Interceptar resposta
      const originalJson = res.json;
      res.json = function(data: any) {
        cacheService.set(key, data, ttl).catch(error => {
          logger.error('Erro ao armazenar no cache', {
            error,
            key,
            ttl
          });
        });
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache', {
        error,
        path: req.path,
        method: req.method
      });
      next();
    }
  };
}

// Middleware de cache para rotas específicas
export function routeCacheMiddleware(routes: { [key: string]: number }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apenas para requisições GET
      if (req.method !== 'GET') {
        return next();
      }

      const ttl = routes[req.path];
      if (!ttl) {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        logger.debug('Dados obtidos do cache da rota', {
          key,
          path: req.path,
          method: req.method,
          ttl
        });
        return res.json(cachedData);
      }

      // Interceptar resposta
      const originalJson = res.json;
      res.json = function(data: any) {
        cacheService.set(key, data, ttl).catch(error => {
          logger.error('Erro ao armazenar rota no cache', {
            error,
            key,
            ttl
          });
        });
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache de rotas', {
        error,
        path: req.path,
        method: req.method
      });
      next();
    }
  };
}

// Middleware de cache para queries
export function queryCacheMiddleware(ttl: number = 3600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apenas para requisições GET
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:query:${req.originalUrl}`;
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        logger.debug('Query obtida do cache', {
          key,
          path: req.path,
          method: req.method
        });
        return res.json(cachedData);
      }

      // Interceptar resposta
      const originalJson = res.json;
      res.json = function(data: any) {
        cacheService.set(key, data, ttl).catch(error => {
          logger.error('Erro ao armazenar query no cache', {
            error,
            key,
            ttl
          });
        });
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache de queries', {
        error,
        path: req.path,
        method: req.method
      });
      next();
    }
  };
}

// Middleware de cache para respostas parciais
export function partialCacheMiddleware(ttl: number = 3600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apenas para requisições GET
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:partial:${req.originalUrl}`;
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        logger.debug('Dados parciais obtidos do cache', {
          key,
          path: req.path,
          method: req.method
        });
        return res.json(cachedData);
      }

      // Interceptar resposta
      const originalJson = res.json;
      res.json = function(data: any) {
        // Armazenar apenas dados parciais
        const partialData = {
          timestamp: Date.now(),
          data: data.slice(0, 10) // Exemplo: apenas 10 itens
        };

        cacheService.set(key, partialData, ttl).catch(error => {
          logger.error('Erro ao armazenar dados parciais no cache', {
            error,
            key,
            ttl
          });
        });
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache parcial', {
        error,
        path: req.path,
        method: req.method
      });
      next();
    }
  };
}

// Middleware de cache para respostas condicionais
export function conditionalCacheMiddleware(ttl: number = 3600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Não usar cache para métodos não GET
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:conditional:${req.originalUrl}`;
      const cachedData = await cacheService.get(key) as CacheData | null;

      if (cachedData) {
        const etag = req.headers['if-none-match'];
        if (etag === cachedData.etag) {
          logger.debug('Resposta condicional do cache', {
            key,
            path: req.path,
            method: req.method
          });
          return res.status(304).send();
        }
      }

      // Interceptar resposta
      const originalJson = res.json;
      res.json = function(data: any) {
        const etag = require('crypto')
          .createHash('md5')
          .update(JSON.stringify(data))
          .digest('hex');

        const cacheData: CacheData = {
          data,
          etag,
          timestamp: Date.now()
        };

        cacheService.set(key, cacheData, ttl).catch(error => {
          logger.error('Erro ao armazenar dados condicionais no cache', {
            error,
            key,
            ttl
          });
        });

        res.setHeader('ETag', etag);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache condicional', {
        error,
        path: req.path,
        method: req.method
      });
      next();
    }
  };
} 