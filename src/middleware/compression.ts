import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { logger } from '../lib/logger';

// Configuração da compressão
const compressionOptions = {
  level: 6, // Nível de compressão (0-9)
  threshold: 1024, // Tamanho mínimo para compressão (bytes)
  filter: (_req: Request, res: Response) => {
    // Não comprimir se já estiver comprimido
    if (res.getHeader('content-encoding')) {
      return false;
    }

    // Não comprimir se for uma imagem já comprimida
    const contentType = res.getHeader('content-type');
    if (typeof contentType === 'string') {
      if (contentType.includes('image/')) {
        return false;
      }
    }

    // Não comprimir se for um arquivo pequeno
    const contentLength = res.getHeader('content-length');
    if (contentLength && Number(contentLength) < 1024) {
      return false;
    }

    return true;
  }
};

// Middleware de compressão
export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression(compressionOptions)(req, res, (err) => {
    if (err) {
      logger.error('Erro na compressão', {
        error: err,
        path: req.path,
        method: req.method
      });
      return next();
    }

    // Log de compressão
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding?: string | (() => void), cb?: () => void) {
      const contentLength = res.getHeader('content-length');
      const contentEncoding = res.getHeader('content-encoding');

      if (contentEncoding === 'gzip' || contentEncoding === 'deflate') {
        logger.debug('Resposta comprimida', {
          path: req.path,
          method: req.method,
          originalSize: contentLength,
          encoding: contentEncoding
        });
      }

      if (typeof encoding === 'function') {
        return originalEnd.call(this, chunk, encoding);
      }
      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  });
}

// Middleware de compressão para tipos específicos
export function typeCompressionMiddleware(types: string[]) {
  return compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      const contentType = res.getHeader('content-type');
      if (typeof contentType === 'string') {
        return types.some(type => contentType.includes(type));
      }
      return false;
    }
  });
}

// Middleware de compressão para tamanhos específicos
export function sizeCompressionMiddleware(minSize: number, maxSize: number) {
  return compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      const contentLength = res.getHeader('content-length');
      if (contentLength) {
        const size = Number(contentLength);
        return size >= minSize && size <= maxSize;
      }
      return false;
    }
  });
}

// Middleware de compressão para rotas específicas
export function routeCompressionMiddleware(routes: string[]) {
  return compression({
    ...compressionOptions,
    filter: (req: Request, _res: Response) => {
      return routes.some(route => req.path.startsWith(route));
    }
  });
}

// Middleware de compressão para métodos específicos
export function methodCompressionMiddleware(methods: string[]) {
  return compression({
    ...compressionOptions,
    filter: (req: Request, _res: Response) => {
      return methods.includes(req.method);
    }
  });
}

// Middleware de compressão para respostas de erro
export function errorCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      return res.statusCode >= 400;
    }
  })(req, res, next);
}

// Middleware de compressão para respostas de sucesso
export function successCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      return res.statusCode < 400;
    }
  })(req, res, next);
}

// Middleware de compressão para respostas JSON
export function jsonCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      const contentType = res.getHeader('content-type');
      return typeof contentType === 'string' && contentType.includes('application/json');
    }
  })(req, res, next);
}

// Middleware de compressão para respostas HTML
export function htmlCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      const contentType = res.getHeader('content-type');
      return typeof contentType === 'string' && contentType.includes('text/html');
    }
  })(req, res, next);
}

// Middleware de compressão para respostas CSS
export function cssCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      const contentType = res.getHeader('content-type');
      return typeof contentType === 'string' && contentType.includes('text/css');
    }
  })(req, res, next);
}

// Middleware de compressão para respostas JavaScript
export function jsCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  compression({
    ...compressionOptions,
    filter: (_req: Request, res: Response) => {
      const contentType = res.getHeader('content-type');
      return typeof contentType === 'string' && contentType.includes('application/javascript');
    }
  })(req, res, next);
} 