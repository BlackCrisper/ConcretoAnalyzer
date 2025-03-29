import express, { RequestHandler } from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { reportLimiter } from '../lib/rateLimit';
import {
  generateProjectReport,
  getSharedReports,
  getReport,
  downloadReport,
  shareReport
} from '../controllers/reportController';

const router = express.Router();

// Validações
const projectIdValidation = [
  param('projectId').isUUID().withMessage('ID de projeto inválido')
];

const reportIdValidation = [
  param('reportId').isUUID().withMessage('ID de relatório inválido')
];

const shareValidation = [
  param('userId').isUUID().withMessage('ID de usuário inválido'),
  param('accessLevel').isIn(['view', 'edit']).withMessage('Nível de acesso inválido')
];

// Middleware de autenticação para todas as rotas
router.use(authMiddleware as RequestHandler);

// Rotas
router.post(
  '/:projectId/generate',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  validateRequest,
  reportLimiter,
  generateProjectReport as RequestHandler
);

router.get(
  '/:projectId',
  projectIdValidation,
  validateRequest,
  getSharedReports as RequestHandler
);

router.get(
  '/:projectId/:reportId',
  projectIdValidation,
  reportIdValidation,
  validateRequest,
  getReport as RequestHandler
);

router.get(
  '/:projectId/:reportId/download',
  projectIdValidation,
  reportIdValidation,
  validateRequest,
  downloadReport as RequestHandler
);

router.post(
  '/:projectId/:reportId/share/:userId',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  reportIdValidation,
  shareValidation,
  validateRequest,
  shareReport as RequestHandler
);

export default router; 