import { Response } from 'express';
import { executeQuery } from '../lib/db';
import { generateReport } from '../services/reportGenerationService';
import fs from 'fs/promises';
import { AuthRequest } from '../middleware/auth';

interface Project {
  user_id: string;
}

interface Analysis {
  id: string;
  results: any;
}

interface Report {
  id: string;
  user_id: string;
  status: string;
  file_path?: string;
  file_name?: string;
}

interface User {
  id: string;
}

export async function generateProjectReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o projeto existe e se o usuário tem acesso
    const project = await executeQuery<Project>(`SELECT user_id FROM Projects WHERE id = $1`, [
      projectId,
    ]);

    if (!project[0]) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    if (role !== 'admin' && project[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    // Verificar se já existe uma análise concluída
    const analysis = await executeQuery<Analysis>(
      `SELECT id, results
       FROM ProjectReports
       WHERE project_id = $1
       AND status = 'completed'
       ORDER BY created_at DESC
       LIMIT 1`,
      [projectId]
    );

    if (!analysis[0]) {
      res.status(400).json({ error: 'Nenhuma análise concluída encontrada para este projeto' });
      return;
    }

    // Criar registro do relatório
    const result = await executeQuery<{ id: string }>(
      `INSERT INTO ProjectReports (project_id, type, status, created_by)
       RETURNING id
       VALUES ($1, 'report', 'processing', $2)`,
      [projectId, userId]
    );

    const reportId = result[0].id;

    // Gerar relatório em background
    generateReport(projectId).catch(error => {
      console.error('Error generating report:', error);
      executeQuery(
        `UPDATE ProjectReports
         SET status = 'error',
             error_message = $1
         WHERE id = $2`,
        [error.message, reportId]
      );
    });

    res.status(201).json({
      message: 'Geração de relatório iniciada com sucesso',
      report: {
        id: reportId,
        projectId,
        status: 'processing',
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

export async function getReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o relatório existe e se o usuário tem acesso
    const report = await executeQuery<Report>(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = $1
       AND r.type = 'report'`,
      [id]
    );

    if (!report[0]) {
      res.status(404).json({ error: 'Relatório não encontrado' });
      return;
    }

    if (role !== 'admin' && report[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    res.json(report[0]);
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
}

export async function downloadReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o relatório existe e se o usuário tem acesso
    const report = await executeQuery<Report>(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = $1
       AND r.type = 'report'`,
      [id]
    );

    if (!report[0]) {
      res.status(404).json({ error: 'Relatório não encontrado' });
      return;
    }

    if (role !== 'admin' && report[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    if (report[0].status !== 'completed') {
      res.status(400).json({ error: 'Relatório ainda não concluído' });
      return;
    }

    // Verificar se o arquivo existe fisicamente
    try {
      await fs.access(report[0].file_path!);
    } catch (error) {
      res.status(404).json({ error: 'Arquivo do relatório não encontrado no servidor' });
      return;
    }

    res.download(report[0].file_path!, report[0].file_name!);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Erro ao baixar relatório' });
  }
}

export async function shareReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o relatório existe e se o usuário tem acesso
    const report = await executeQuery<Report>(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = $1
       AND r.type = 'report'`,
      [id]
    );

    if (!report[0]) {
      res.status(404).json({ error: 'Relatório não encontrado' });
      return;
    }

    if (userRole !== 'admin' && report[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    if (report[0].status !== 'completed') {
      res.status(400).json({ error: 'Relatório ainda não concluído' });
      return;
    }

    // Buscar usuário pelo email
    const user = await executeQuery<User>(`SELECT id FROM Users WHERE email = $1`, [email]);

    if (!user[0]) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Compartilhar relatório
    await executeQuery(
      `INSERT INTO SharedReports (report_id, shared_user_id, access_level)
       VALUES ($1, $2, $3)`,
      [id, user[0].id, role]
    );

    res.json({
      message: 'Relatório compartilhado com sucesso',
      sharedWith: {
        reportId: id,
        sharedUserId: user[0].id,
        accessLevel: role,
      },
    });
  } catch (error) {
    console.error('Error sharing report:', error);
    res.status(500).json({ error: 'Erro ao compartilhar relatório' });
  }
}

export async function getSharedReports(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Buscar relatórios compartilhados
    const reports = await executeQuery<Report>(
      `SELECT r.*
       FROM ProjectReports r
       JOIN SharedReports sr ON r.id = sr.report_id
       WHERE r.project_id = $1
       AND sr.shared_user_id = $2
       AND r.type = 'report'`,
      [projectId, userId]
    );

    res.json(reports);
  } catch (error) {
    console.error('Error getting shared reports:', error);
    res.status(500).json({ error: 'Erro ao buscar relatórios compartilhados' });
  }
}
