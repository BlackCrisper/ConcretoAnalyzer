import { config } from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do arquivo .env.test
config({ path: path.resolve(__dirname, '../.env.test') });

// Configurar variáveis de ambiente para testes
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Configurar timeouts para testes
jest.setTimeout(30000);

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configuração do console para testes
const originalConsole = { ...console };
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
console.debug = jest.fn();

// Restaura o console após os testes
afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.debug = originalConsole.debug;
});

// Configuração de mocks globais
jest.mock('../lib/db', () => ({
  executeQuery: jest.fn(),
}));

jest.mock('../lib/email', () => ({
  sendEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendAnalysisCompleteEmail: jest.fn(),
  sendReportGeneratedEmail: jest.fn(),
  sendShareNotificationEmail: jest.fn(),
  sendErrorNotificationEmail: jest.fn(),
}));

jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
  httpLogger: jest.fn(),
  logUnhandledError: jest.fn(),
  logUnhandledRejection: jest.fn(),
}));

// Configuração de diretórios de teste
export const TEST_DIR = path.join(__dirname);
export const FIXTURES_DIR = path.join(TEST_DIR, 'fixtures');

// Funções auxiliares para testes
export const createTestFile = (filename: string, content: string): string => {
  const filePath = path.join(FIXTURES_DIR, filename);
  // Implementação da criação de arquivo de teste
  return filePath;
};

export const cleanupTestFiles = (): void => {
  // Implementação da limpeza de arquivos de teste
};

// Configuração de variáveis de ambiente de teste
export const TEST_CONFIG = {
  OCR: {
    MODEL_PATH: path.join(FIXTURES_DIR, 'models'),
    LANGUAGE: 'por',
    CONFIDENCE_THRESHOLD: 0.7,
    MAX_RETRIES: 3,
    TIMEOUT: 30000,
  },
  DB: {
    HOST: 'localhost',
    PORT: 5432,
    DATABASE: 'estrutura_test',
    USER: 'postgres',
    PASSWORD: 'postgres',
  },
  JWT: {
    SECRET: 'test-secret',
    EXPIRES_IN: '1h',
  },
  SERVER: {
    PORT: 3001,
    NODE_ENV: 'test',
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['pdf', 'png', 'jpg', 'jpeg'],
    UPLOAD_DIR: path.join(FIXTURES_DIR, 'uploads'),
  },
};

// Configuração de dados de teste
export const TEST_DATA = {
  users: [
    {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      role: 'engineer',
    },
  ],
  projects: [
    {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      userId: 1,
      status: 'active',
    },
  ],
  files: [
    {
      id: 1,
      projectId: 1,
      name: 'test.pdf',
      type: 'pdf',
      path: path.join(FIXTURES_DIR, 'test.pdf'),
      status: 'processed',
    },
  ],
};
