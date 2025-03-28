import express, { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectFiles,
  getProjectAnalysis,
  getProjectReport
} from '../controllers/projectController';

const router = Router();

// Validações
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'deleted'])
    .withMessage('Status inválido')
];

const projectIdValidation = [
  param('id').isUUID().withMessage('ID de projeto inválido')
];

// Middleware de autenticação para todas as rotas
router.use(authenticate as express.RequestHandler);

// Rotas
router.post(
  '/',
  checkRole(['admin', 'engineer']),
  projectValidation,
  validateRequest,
  createProject
);

router.get('/', getProjects);

router.get(
  '/:id',
  projectIdValidation,
  validateRequest,
  getProject
);

router.put(
  '/:id',
  checkRole(['admin', 'engineer']),
  projectIdValidation,
  projectValidation,
  validateRequest,
  updateProject
);

router.delete(
  '/:id',
  checkRole(['admin']),
  projectIdValidation,
  validateRequest,
  deleteProject
);

// Rotas relacionadas
router.get('/:id/files', getProjectFiles);
router.get('/:id/analysis', getProjectAnalysis);
router.get('/:id/report', getProjectReport);

export default router; 