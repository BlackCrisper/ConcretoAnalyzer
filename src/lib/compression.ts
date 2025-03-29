const compression = require('compression');
import { logger } from './logger';

// Configuração de compressão
const compressionOptions = {
  level: 6, // Nível de compressão (1-9)
  threshold: 1024, // Tamanho mínimo para compressão (1KB)
  filter: (_: any, res: any) => {
    // Não comprimir se já estiver comprimido
    if (res.headers['x-no-compression']) {
      return false;
    }

    // Comprimir apenas tipos de conteúdo específicos
    const contentType = res.getHeader('Content-Type');
    if (!contentType) {
      return false;
    }

    // Lista de tipos de conteúdo para compressão
    const compressibleTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'application/xml+rss',
      'text/xml',
      'application/x-yaml',
      'text/yaml',
      'text/csv',
      'text/markdown',
      'application/x-httpd-php',
      'application/x-httpd-cgi',
      'application/x-www-form-urlencoded',
      'application/x-font-ttf',
      'application/x-font-otf',
      'application/x-font-woff',
      'application/x-font-woff2',
      'application/vnd.ms-fontobject',
    ];

    return compressibleTypes.some(type => contentType.includes(type));
  },
};

// Middleware de compressão
export const compressionMiddleware = compression(compressionOptions);

// Middleware para logging de compressão
export const compressionLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.getHeader('content-encoding') === 'gzip') {
      logger.debug('Resposta comprimida', {
        method: req.method,
        url: req.url,
        duration,
        originalSize: res.getHeader('content-length'),
        compressedSize: res.getHeader('content-length'),
      });
    }
  });
  next();
};

// Middleware para compressão específica de tipos
export const typeCompressionMiddleware = (types: string[]) => {
  return compression({
    ...compressionOptions,
    filter: (_: any, res: any) => {
      const contentType = res.getHeader('Content-Type');
      return types.some(type => contentType?.includes(type));
    },
  });
};

// Middleware para compressão baseada em tamanho
export const sizeCompressionMiddleware = (minSize: number) => {
  return compression({
    ...compressionOptions,
    threshold: minSize,
  });
};

// Middleware para compressão de rotas específicas
export const routeCompressionMiddleware = (routes: string[]) => {
  return compression({
    ...compressionOptions,
    filter: (req: any, _: any) => {
      return routes.some(route => req.path.startsWith(route));
    },
  });
};

// Middleware para compressão de métodos específicos
export const methodCompressionMiddleware = (methods: string[]) => {
  return compression({
    ...compressionOptions,
    filter: (req: any, _: any) => {
      return methods.includes(req.method);
    },
  });
};

// Middleware para compressão de erros
export const errorCompressionMiddleware = compression({
  ...compressionOptions,
  filter: (_: any, res: any) => {
    return res.statusCode >= 400;
  },
});

// Middleware para compressão de sucesso
export const successCompressionMiddleware = compression({
  ...compressionOptions,
  filter: (_: any, res: any) => {
    return res.statusCode < 400;
  },
});

// Middleware para compressão de JSON
export const jsonCompressionMiddleware = typeCompressionMiddleware(['application/json']);

// Middleware para compressão de HTML
export const htmlCompressionMiddleware = typeCompressionMiddleware(['text/html']);

// Middleware para compressão de CSS
export const cssCompressionMiddleware = typeCompressionMiddleware(['text/css']);

// Middleware para compressão de JavaScript
export const jsCompressionMiddleware = typeCompressionMiddleware([
  'application/javascript',
  'text/javascript',
]);

// Configurar compressão
export const defaultCompression = compression(compressionOptions);

// Configurar compressão para JSON
export const jsonCompression = compression({
  threshold: 1024,
  level: 6,
  filter: (_: any, res: any) => {
    return res.getHeader('Content-Type')?.includes('application/json') || false;
  },
});

// Configurar compressão para XML
export const xmlCompression = compression({
  threshold: 1024,
  level: 6,
  filter: (_: any, res: any) => {
    return res.getHeader('Content-Type')?.includes('application/xml') || false;
  },
});

// Configurar compressão para HTML
export const htmlCompression = compression({
  threshold: 1024,
  level: 6,
  filter: (_: any, __: any) => {
    return true;
  },
});

// Configurar compressão para CSS
export const cssCompression = compression({
  threshold: 1024,
  level: 6,
  filter: (_: any, __: any) => {
    return true;
  },
});
