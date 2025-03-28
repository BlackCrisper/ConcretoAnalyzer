import { Request, Response } from 'express';
import { executeQuery } from '../lib/db';
import { logger } from '../lib/logger';

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const result = await executeQuery<{ id: string }>(
      'INSERT INTO Projects (name, description, user_id) VALUES ($1, $2, $3) RETURNING id',
      [name, description, userId]
    );

    const projectId = result[0]?.id;

    if (!projectId) {
      res.status(500).json({ error: 'Erro ao criar projeto' });
      return;
    }

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project: {
        id: projectId,
        name,
        description,
        userId,
        status: 'draft'
      }
    });
  } catch (error) {
    logger.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
}

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    let query = `
      SELECT p.*, u.name as user_name
      FROM Projects p
      JOIN Users u ON p.user_id = u.id
    `;

    let params: any[] = [];

    // Se não for admin, mostrar apenas projetos do usuário
    if (role !== 'admin') {
      query += ` WHERE p.user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await executeQuery(query, params);

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
}

export async function getProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    let query = `
      SELECT p.*, u.name as user_name
      FROM Projects p
      JOIN Users u ON p.user_id = u.id
      WHERE p.id = $1
    `;

    let params = [id];

    // Se não for admin, verificar se o projeto pertence ao usuário
    if (role !== 'admin') {
      query += ` AND p.user_id = $2`;
      params.push(userId);
    }

    const result = await executeQuery(query, params);

    if (!result[0]) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    logger.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o projeto existe e se o usuário tem acesso
    const project = await executeQuery<{ user_id: string }>(
      'SELECT user_id FROM Projects WHERE id = $1',
      [id]
    );

    if (!project[0]) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    if (role !== 'admin' && project[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    await executeQuery(
      `UPDATE Projects
       SET name = $1,
           description = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [name, description, id]
    );

    res.json({ message: 'Projeto atualizado com sucesso' });
  } catch (error) {
    logger.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o projeto existe e se o usuário tem acesso
    const project = await executeQuery<{ user_id: string }>(
      'SELECT user_id FROM Projects WHERE id = $1',
      [id]
    );

    if (!project[0]) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    if (role !== 'admin' && project[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    await executeQuery('DELETE FROM Projects WHERE id = $1', [id]);

    res.json({ message: 'Projeto excluído com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir projeto:', error);
    res.status(500).json({ error: 'Erro ao excluir projeto' });
  }
}

export async function getProjectFiles(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    let query = `
      SELECT f.*
      FROM ProjectFiles f
      JOIN Projects p ON f.project_id = p.id
      WHERE p.id = $1
    `;

    let params = [id];

    // Se não for admin, verificar se o projeto pertence ao usuário
    if (role !== 'admin') {
      query += ` AND p.user_id = $2`;
      params.push(userId);
    }

    const result = await executeQuery(query, params);

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar arquivos do projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar arquivos do projeto' });
  }
}

export async function getProjectAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    let query = `
      SELECT a.*
      FROM ProjectAnalysis a
      JOIN Projects p ON a.project_id = p.id
      WHERE p.id = $1
    `;

    let params = [id];

    // Se não for admin, verificar se o projeto pertence ao usuário
    if (role !== 'admin') {
      query += ` AND p.user_id = $2`;
      params.push(userId);
    }

    const result = await executeQuery(query, params);

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar análises do projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar análises do projeto' });
  }
}

export async function getProjectReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    let query = `
      SELECT r.*
      FROM ProjectReports r
      JOIN Projects p ON r.project_id = p.id
      WHERE p.id = $1
    `;

    let params = [id];

    // Se não for admin, verificar se o projeto pertence ao usuário
    if (role !== 'admin') {
      query += ` AND p.user_id = $2`;
      params.push(userId);
    }

    const result = await executeQuery(query, params);

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar relatórios do projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar relatórios do projeto' });
  }
} 