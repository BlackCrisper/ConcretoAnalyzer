import { Request, Response } from 'express';
import { executeQuery } from '../lib/db';
import { processProjectFile } from '../services/fileProcessingService';
import fs from 'fs/promises';
import { FileType, ProjectFile } from '../types/project';
import { logger } from '../lib/logger';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar se o projeto existe e pertence ao usuário
    const project = await executeQuery<{ user_id: string }>(
      'SELECT user_id FROM Projects WHERE id = $1',
      [projectId]
    );

    if (!project || project[0].user_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Determinar o tipo do arquivo
    const fileType = file.mimetype.includes('pdf') ? 'pdf' as FileType :
                     file.mimetype.includes('image') ? 'image' as FileType :
                     file.mimetype.includes('dwg') ? 'dwg' as FileType : null;

    if (!fileType) {
      return res.status(400).json({ error: 'Tipo de arquivo não suportado' });
    }

    // Inserir arquivo no banco de dados
    const result = await executeQuery<{ id: string }>(
      `INSERT INTO ProjectFiles (
        project_id, name, type, path, size, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id`,
      [projectId, file.originalname, fileType, file.path, file.size, 'pending']
    );

    const fileId = result[0].id;

    // Criar objeto ProjectFile para processamento
    const projectFile: ProjectFile = {
      id: fileId,
      projectId,
      name: file.originalname,
      type: fileType,
      path: file.path,
      size: file.size,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Processar arquivo em background
    processProjectFile(projectFile).catch(error => {
      logger.error('Erro ao processar arquivo:', error);
    });

    return res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      fileId
    });
  } catch (error) {
    logger.error('Erro ao fazer upload do arquivo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export async function getFile(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const query = `
      SELECT f.*, p.user_id
      FROM ProjectFiles f
      JOIN Projects p ON f.project_id = p.id
      WHERE f.id = $1
    `;

    const result = await executeQuery<{ user_id: string }>(query, [id]);

    if (!result[0]) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    if (role !== 'admin' && result[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    logger.error('Erro ao buscar arquivo:', error);
    res.status(500).json({ error: 'Erro ao buscar arquivo' });
  }
}

export async function deleteFile(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o arquivo existe e se o usuário tem acesso
    const file = await executeQuery<{ user_id: string; path: string }>(
      `SELECT f.*, p.user_id
       FROM ProjectFiles f
       JOIN Projects p ON f.project_id = p.id
       WHERE f.id = $1`,
      [id]
    );

    if (!file[0]) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    if (role !== 'admin' && file[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    // Excluir arquivo físico
    try {
      await fs.unlink(file[0].path);
    } catch (error) {
      logger.error('Erro ao excluir arquivo físico:', error);
    }

    // Excluir registro do banco
    await executeQuery('DELETE FROM ProjectFiles WHERE id = $1', [id]);

    res.json({ message: 'Arquivo excluído com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir arquivo:', error);
    res.status(500).json({ error: 'Erro ao excluir arquivo' });
  }
}

export async function downloadFile(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o arquivo existe e se o usuário tem acesso
    const file = await executeQuery<{ user_id: string; path: string; name: string }>(
      `SELECT f.*, p.user_id
       FROM ProjectFiles f
       JOIN Projects p ON f.project_id = p.id
       WHERE f.id = $1`,
      [id]
    );

    if (!file[0]) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    if (role !== 'admin' && file[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    // Verificar se o arquivo existe no disco
    try {
      await fs.access(file[0].path);
    } catch (error) {
      res.status(404).json({ error: 'Arquivo não encontrado no disco' });
      return;
    }

    res.download(file[0].path, file[0].name);
  } catch (error) {
    logger.error('Erro ao baixar arquivo:', error);
    res.status(500).json({ error: 'Erro ao baixar arquivo' });
  }
}

export async function getFileStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o arquivo existe e se o usuário tem acesso
    const file = await executeQuery<{
      user_id: string;
      status: string;
      error_message: string | null;
      extracted_data: any;
    }>(
      `SELECT f.*, p.user_id
       FROM ProjectFiles f
       JOIN Projects p ON f.project_id = p.id
       WHERE f.id = $1`,
      [id]
    );

    if (!file[0]) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    if (role !== 'admin' && file[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    res.json({
      status: file[0].status,
      errorMessage: file[0].error_message,
      extractedData: file[0].extracted_data
    });
  } catch (error) {
    logger.error('Erro ao buscar status do arquivo:', error);
    res.status(500).json({ error: 'Erro ao buscar status do arquivo' });
  }
}

export async function getFiles(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o projeto existe e se o usuário tem acesso
    const project = await executeQuery<{ user_id: string }>(
      'SELECT user_id FROM Projects WHERE id = $1',
      [projectId]
    );

    if (!project[0]) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    if (role !== 'admin' && project[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const result = await executeQuery(
      'SELECT * FROM ProjectFiles WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar arquivos:', error);
    res.status(500).json({ error: 'Erro ao buscar arquivos' });
  }
} 