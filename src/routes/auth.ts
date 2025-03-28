import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { register, login, refreshToken, logout, getProfile, updateProfile, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validações
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('role')
    .isIn(['admin', 'engineer', 'client'])
    .withMessage('Papel inválido')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Rotas públicas
router.post('/login', validateRequest, loginValidation, login);

router.post('/register', validateRequest, registerValidation, register);

router.post('/forgot-password', validateRequest, forgotPassword);

router.post('/reset-password/:token', validateRequest, resetPassword);

router.get('/verify-email/:token', validateRequest, verifyEmail);

// Rotas protegidas
const protectedRouter = express.Router();

protectedRouter.post('/logout', logout);
protectedRouter.post('/refresh-token', refreshToken);
protectedRouter.get('/me', getProfile);
protectedRouter.put('/me', validateRequest, updateProfile);

router.use('/api', authenticate as express.RequestHandler, protectedRouter);

export default router; 