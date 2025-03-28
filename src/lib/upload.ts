import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_CONFIG } from '../config/env';
import { logger } from './logger';

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const uploadDir = path.join(process.cwd(), UPLOAD_CONFIG.UPLOAD_DIR);
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configurar filtro de arquivos
const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = UPLOAD_CONFIG.ALLOWED_FILE_TYPES;
  const fileType = file.mimetype;

  if (allowedTypes.includes(fileType)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(', ')}`));
  }
};

// Configurar upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 1
  }
});

// Middleware para tratamento de erros do upload
export const handleUploadError = (err: any, _: any, res: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.error('Arquivo muito grande', {
        error: err,
        fileSize: res.file?.size,
        maxSize: UPLOAD_CONFIG.MAX_FILE_SIZE
      });
      return res.status(400).json({
        error: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      logger.error('Muitos arquivos', {
        error: err,
        fileCount: res.files?.length
      });
      return res.status(400).json({
        error: 'Apenas um arquivo pode ser enviado por vez'
      });
    }
  }

  if (err.message.includes('Tipo de arquivo não permitido')) {
    logger.error('Tipo de arquivo inválido', {
      error: err,
      fileType: res.file?.mimetype
    });
    return res.status(400).json({
      error: err.message
    });
  }

  logger.error('Erro no upload', {
    error: err,
    file: res.file
  });
  return res.status(500).json({
    error: 'Erro ao fazer upload do arquivo'
  });
};

// Função para validar arquivo
export function validateFile(file: Express.Multer.File) {
  const errors: string[] = [];

  // Verificar tamanho
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    errors.push(`Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Verificar tipo
  if (!UPLOAD_CONFIG.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    errors.push(`Tipo de arquivo não permitido: ${file.mimetype}`);
  }

  // Verificar extensão
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = UPLOAD_CONFIG.ALLOWED_FILE_TYPES.map(type => 
    type.split('/')[1]
  );
  if (!allowedExts.includes(ext.slice(1))) {
    errors.push(`Extensão não permitida: ${ext}`);
  }

  return errors;
}

// Função para gerar nome único de arquivo
export function generateUniqueFilename(originalname: string) {
  return `${uuidv4()}${path.extname(originalname)}`;
}

// Função para obter caminho completo do arquivo
export function getFilePath(filename: string) {
  return path.join(process.cwd(), UPLOAD_CONFIG.UPLOAD_DIR, filename);
}

// Função para verificar se arquivo existe
export function fileExists(filename: string) {
  const filepath = getFilePath(filename);
  return require('fs').existsSync(filepath);
}

// Função para deletar arquivo
export function deleteFile(filename: string) {
  const filepath = getFilePath(filename);
  if (fileExists(filename)) {
    require('fs').unlinkSync(filepath);
    logger.info('Arquivo deletado', { filename });
  }
}

// Função para mover arquivo
export function moveFile(oldPath: string, newPath: string) {
  require('fs').renameSync(oldPath, newPath);
  logger.info('Arquivo movido', { oldPath, newPath });
}

// Função para copiar arquivo
export function copyFile(source: string, destination: string) {
  require('fs').copyFileSync(source, destination);
  logger.info('Arquivo copiado', { source, destination });
}

// Função para obter informações do arquivo
export function getFileInfo(filepath: string) {
  const stats = require('fs').statSync(filepath);
  return {
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile()
  };
} 