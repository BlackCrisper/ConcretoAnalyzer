import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { Request, Response } from 'express';

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
}).single('file');

// Middleware de tratamento de erros
export function handleUploadError(err: any, req: Request, res: Response, next: any) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Erro ao fazer upload do arquivo'
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de arquivo não permitido'
    });
  }

  next();
}

export function handleUploadSuccess(req: Request, res: Response, next: any) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Nenhum arquivo enviado'
    });
  }

  next();
}

export function handleUploadError500(err: Error, req: Request, res: Response, next: any) {
  logger.error('Erro no upload:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
}

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

export { upload }; 