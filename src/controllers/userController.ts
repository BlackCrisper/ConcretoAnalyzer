import { Request, Response } from 'express';
import { executeQuery } from '../lib/db';
import bcrypt from 'bcryptjs';

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    if (role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const users = await executeQuery(
      `SELECT id, name, email, role, created_at, updated_at
       FROM Users
       ORDER BY name`
    );

    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    if (role !== 'admin' && userId !== id) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const user = await executeQuery(
      `SELECT id, name, email, role, created_at, updated_at
       FROM Users
       WHERE id = @id`,
      { id }
    );

    if (!user[0]) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    if (userRole !== 'admin' && userId !== id) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    // Verificar se o usuário existe
    const existingUser = await executeQuery(
      `SELECT id FROM Users WHERE id = @id`,
      { id }
    );

    if (!existingUser[0]) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Verificar se o email já está em uso por outro usuário
    if (email) {
      const emailUser = await executeQuery(
        `SELECT id FROM Users WHERE email = @email AND id != @id`,
        { email, id }
      );

      if (emailUser[0]) {
        res.status(400).json({ error: 'Email já está em uso' });
        return;
      }
    }

    // Atualizar usuário
    let query = `
      UPDATE Users
      SET name = @name,
          email = @email,
          updated_at = GETDATE()
    `;

    const params: any = {
      id,
      name,
      email
    };

    // Se estiver alterando a senha
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += `, password = @password`;
      params.password = hashedPassword;
    }

    // Se for admin, pode alterar a role
    if (userRole === 'admin' && role) {
      query += `, role = @role`;
      params.role = role;
    }

    query += ` WHERE id = @id`;

    await executeQuery(query, params);

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    if (role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    if (userId === id) {
      res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
      return;
    }

    // Verificar se o usuário existe
    const user = await executeQuery(
      `SELECT id FROM Users WHERE id = @id`,
      { id }
    );

    if (!user[0]) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Verificar se o usuário tem projetos
    const projects = await executeQuery(
      `SELECT id FROM Projects WHERE user_id = @id`,
      { id }
    );

    if (projects[0]) {
      res.status(400).json({ error: 'Não é possível excluir um usuário que possui projetos' });
      return;
    }

    await executeQuery(`DELETE FROM Users WHERE id = @id`, { id });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const user = await executeQuery(
      `SELECT id, name, email, role, created_at, updated_at
       FROM Users
       WHERE id = @id`,
      { id: userId }
    );

    if (!user[0]) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário atual' });
  }
}

export async function updateCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { name, email, password } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o email já está em uso por outro usuário
    if (email) {
      const emailUser = await executeQuery(
        `SELECT id FROM Users WHERE email = @email AND id != @userId`,
        { email, userId }
      );

      if (emailUser[0]) {
        res.status(400).json({ error: 'Email já está em uso' });
        return;
      }
    }

    // Atualizar usuário
    let query = `
      UPDATE Users
      SET name = @name,
          email = @email,
          updated_at = GETDATE()
    `;

    const params: any = {
      userId,
      name,
      email
    };

    // Se estiver alterando a senha
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += `, password = @password`;
      params.password = hashedPassword;
    }

    query += ` WHERE id = @userId`;

    await executeQuery(query, params);

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating current user:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
} 