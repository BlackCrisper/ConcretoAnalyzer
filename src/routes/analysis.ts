import express from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { analysisLimiter } from '../lib/rateLimit';
import {
  startAnalysis,
  getAnalysisStatus,
  getAnalysisResults,
  cancelAnalysis,
} from '../controllers/analysisController';

const router = express.Router();

// Validações
const projectIdValidation = [param('projectId').isUUID().withMessage('ID de projeto inválido')];

const analysisIdValidation = [param('analysisId').isUUID().withMessage('ID de análise inválido')];

// Middleware de autenticação para todas as rotas
router.use(authMiddleware as express.RequestHandler);

// Rotas
router.post(
  '/:projectId/start',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  validateRequest,
  analysisLimiter,
  startAnalysis as unknown as express.RequestHandler
);

router.get(
  '/:projectId/status/:analysisId',
  projectIdValidation,
  analysisIdValidation,
  validateRequest,
  getAnalysisStatus as unknown as express.RequestHandler
);

router.get(
  '/:projectId/results/:analysisId',
  projectIdValidation,
  analysisIdValidation,
  validateRequest,
  getAnalysisResults as unknown as express.RequestHandler
);

router.post(
  '/:projectId/cancel/:analysisId',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  analysisIdValidation,
  validateRequest,
  cancelAnalysis as unknown as express.RequestHandler
);

export default router;
