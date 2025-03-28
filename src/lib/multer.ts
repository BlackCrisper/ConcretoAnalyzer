import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configurar filtro de arquivos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/dwg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'));
  }
};

// Configurar limites
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 5 // Máximo de 5 arquivos por upload
};

// Criar middleware de upload
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware de tratamento de erros
const handleUploadError = (error: multer.MulterError, req: Express.Request, res: Express.Response, next: Function) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      logger.warn('Tentativa de upload de arquivo muito grande', {
        originalname: req.file?.originalname,
        size: req.file?.size
      });
      return res.status(400).json({
        error: 'Arquivo muito grande. Tamanho máximo permitido: 10MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      logger.warn('Tentativa de upload de mais arquivos que o permitido', {
        count: req.files?.length
      });
      return res.status(400).json({
        error: 'Número máximo de arquivos excedido. Máximo permitido: 5'
      });
    }
  }

  if (error.message === 'Tipo de arquivo não permitido') {
    logger.warn('Tentativa de upload de tipo de arquivo não permitido', {
      mimetype: req.file?.mimetype,
      originalname: req.file?.originalname
    });
    return res.status(400).json({
      error: 'Tipo de arquivo não permitido. Tipos permitidos: PDF, JPEG, PNG, DWG'
    });
  }

  logger.error('Erro no upload de arquivo', { error });
  return res.status(500).json({
    error: 'Erro interno ao processar upload'
  });
};

// Função para excluir arquivo
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    throw error;
  }
}

// Função para mover arquivo
export async function moveFile(oldPath: string, newPath: string): Promise<void> {
  try {
    await fs.promises.rename(oldPath, newPath);
  } catch (error) {
    console.error('Erro ao mover arquivo:', error);
    throw error;
  }
}

// Função para verificar se arquivo existe
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Função para obter extensão do arquivo
export function getFileExtension(fileName: string): string {
  return path.extname(fileName).toLowerCase();
}

// Função para obter nome do arquivo sem extensão
export function getFileNameWithoutExtension(fileName: string): string {
  return path.parse(fileName).name;
}

// Função para obter diretório do arquivo
export function getFileDirectory(filePath: string): string {
  return path.dirname(filePath);
}

// Função para obter caminho absoluto
export function getAbsolutePath(relativePath: string): string {
  return path.resolve(relativePath);
}

// Função para criar diretório se não existir
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export { upload, handleUploadError }; 