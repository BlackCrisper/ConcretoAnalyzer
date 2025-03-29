import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../lib/db';
import { generateToken } from '../middleware/auth';
import crypto from 'crypto';
import { User, UserWithPassword } from '../types/project';
import { logger } from '../lib/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await executeQuery<UserWithPassword>(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );

    const user = result[0];
    if (!user) {
      res.status(500).json({ error: 'Erro ao criar usuário' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await executeQuery<UserWithPassword>('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = result[0];

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await executeQuery<User>('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result[0];

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    const result = await executeQuery<User>(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, userId]
    );
    const user = result[0];

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const result = await executeQuery<User>('SELECT * FROM users WHERE email = $1', [email]);
    const user = result[0];

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await executeQuery('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [
      resetToken,
      resetTokenExpiry,
      user.id,
    ]);

    // TODO: Enviar email com token de reset

    res.json({ message: 'Email de recuperação enviado' });
  } catch (error) {
    logger.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ error: 'Erro ao solicitar recuperação de senha' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    const result = await executeQuery<User>(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );
    const user = result[0];

    if (!user) {
      res.status(400).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await executeQuery(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const result = await executeQuery<User>('SELECT * FROM users WHERE verification_token = $1', [
      token,
    ]);
    const user = result[0];

    if (!user) {
      res.status(400).json({ error: 'Token de verificação inválido' });
      return;
    }

    await executeQuery(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1',
      [user.id]
    );

    res.json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    logger.error('Erro ao verificar email:', error);
    res.status(500).json({ error: 'Erro ao verificar email' });
  }
};

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const token = generateToken(userId, role);

    res.json({ token });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Erro ao atualizar token' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    // Aqui você pode implementar a lógica de logout, como invalidar o token
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
}
