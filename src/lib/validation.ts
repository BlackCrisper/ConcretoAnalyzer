import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Interface para erros de validação
interface ValidationError {
  field: string;
  message: string;
}

// Classe para validação
class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Validar string
  public validateString(
    value: any,
    field: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
    } = {}
  ): ValidationError | null {
    if (options.required && !value) {
      return { field, message: 'Campo obrigatório' };
    }

    if (value) {
      if (typeof value !== 'string') {
        return { field, message: 'Deve ser uma string' };
      }

      if (options.minLength && value.length < options.minLength) {
        return { field, message: `Mínimo de ${options.minLength} caracteres` };
      }

      if (options.maxLength && value.length > options.maxLength) {
        return { field, message: `Máximo de ${options.maxLength} caracteres` };
      }

      if (options.pattern && !options.pattern.test(value)) {
        return { field, message: 'Formato inválido' };
      }
    }

    return null;
  }

  // Validar número
  public validateNumber(
    value: any,
    field: string,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
    } = {}
  ): ValidationError | null {
    if (options.required && !value) {
      return { field, message: 'Campo obrigatório' };
    }

    if (value) {
      const num = Number(value);

      if (isNaN(num)) {
        return { field, message: 'Deve ser um número' };
      }

      if (options.integer && !Number.isInteger(num)) {
        return { field, message: 'Deve ser um número inteiro' };
      }

      if (options.min !== undefined && num < options.min) {
        return { field, message: `Mínimo de ${options.min}` };
      }

      if (options.max !== undefined && num > options.max) {
        return { field, message: `Máximo de ${options.max}` };
      }
    }

    return null;
  }

  // Validar email
  public validateEmail(value: any, field: string, required = false): ValidationError | null {
    if (required && !value) {
      return { field, message: 'Campo obrigatório' };
    }

    if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { field, message: 'Email inválido' };
      }
    }

    return null;
  }

  // Validar data
  public validateDate(
    value: any,
    field: string,
    options: {
      required?: boolean;
      min?: Date;
      max?: Date;
    } = {}
  ): ValidationError | null {
    if (options.required && !value) {
      return { field, message: 'Campo obrigatório' };
    }

    if (value) {
      const date = new Date(value);

      if (isNaN(date.getTime())) {
        return { field, message: 'Data inválida' };
      }

      if (options.min && date < options.min) {
        return { field, message: `Data mínima: ${options.min.toISOString()}` };
      }

      if (options.max && date > options.max) {
        return { field, message: `Data máxima: ${options.max.toISOString()}` };
      }
    }

    return null;
  }

  // Validar array
  public validateArray(
    value: any,
    field: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      itemValidator?: (item: any) => ValidationError | null;
    } = {}
  ): ValidationError | null {
    if (options.required && !value) {
      return { field, message: 'Campo obrigatório' };
    }

    if (value) {
      if (!Array.isArray(value)) {
        return { field, message: 'Deve ser um array' };
      }

      if (options.minLength !== undefined && value.length < options.minLength) {
        return { field, message: `Mínimo de ${options.minLength} itens` };
      }

      if (options.maxLength !== undefined && value.length > options.maxLength) {
        return { field, message: `Máximo de ${options.maxLength} itens` };
      }

      if (options.itemValidator) {
        for (let i = 0; i < value.length; i++) {
          const error = options.itemValidator(value[i]);
          if (error) {
            return { field: `${field}[${i}]`, message: error.message };
          }
        }
      }
    }

    return null;
  }

  // Validar objeto
  public validateObject(
    value: any,
    field: string,
    options: {
      required?: boolean;
      schema?: Record<string, (value: any) => ValidationError | null>;
    } = {}
  ): ValidationError | null {
    if (options.required && !value) {
      return { field, message: 'Campo obrigatório' };
    }

    if (value) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        return { field, message: 'Deve ser um objeto' };
      }

      if (options.schema) {
        for (const [key, validator] of Object.entries(options.schema)) {
          const error = validator(value[key]);
          if (error) {
            return { field: `${field}.${key}`, message: error.message };
          }
        }
      }
    }

    return null;
  }
}

// Middleware para validação de requisição
export const validateRequest = (schema: {
  body?: Record<string, (value: any) => ValidationError | null>;
  query?: Record<string, (value: any) => ValidationError | null>;
  params?: Record<string, (value: any) => ValidationError | null>;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    const validation = ValidationService.getInstance();

    // Validar body
    if (schema.body) {
      const bodyError = validation.validateObject(req.body, 'body', {
        schema: schema.body,
      });
      if (bodyError) errors.push(bodyError);
    }

    // Validar query
    if (schema.query) {
      const queryError = validation.validateObject(req.query, 'query', {
        schema: schema.query,
      });
      if (queryError) errors.push(queryError);
    }

    // Validar params
    if (schema.params) {
      const paramsError = validation.validateObject(req.params, 'params', {
        schema: schema.params,
      });
      if (paramsError) errors.push(paramsError);
    }

    if (errors.length > 0) {
      logger.warn('Erro de validação', { errors });
      return res.status(400).json({ errors });
    }

    return next();
  };
};

// Exportar instância do serviço
export const validation = ValidationService.getInstance();
