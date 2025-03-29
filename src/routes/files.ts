import express, { RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { uploadLimiter } from '../lib/rateLimit';
import {
  uploadFile,
  getFiles,
  getFile,
  deleteFile
} from '../controllers/fileController';

const router = express.Router();

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,image/*,dwg').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Validações
const projectIdValidation = [
  param('projectId').isUUID().withMessage('ID de projeto inválido')
];

const fileIdValidation = [
  param('fileId').isUUID().withMessage('ID de arquivo inválido')
];

// Middleware de autenticação para todas as rotas
router.use(authMiddleware as RequestHandler);

// Rotas
router.post(
  '/:projectId',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  validateRequest,
  uploadLimiter,
  upload.single('file'),
  uploadFile
);

router.get(
  '/:projectId',
  projectIdValidation,
  validateRequest,
  getFiles
);

router.get(
  '/:projectId/:fileId',
  projectIdValidation,
  fileIdValidation,
  validateRequest,
  getFile
);

router.delete(
  '/:projectId/:fileId',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  fileIdValidation,
  validateRequest,
  deleteFile
);

export default router; 