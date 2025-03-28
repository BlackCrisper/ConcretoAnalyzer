import { Request, Response } from 'express';
import { executeQuery } from '../lib/db';
import { generateReport } from '../services/reportGenerationService';
import path from 'path';
import fs from 'fs/promises';

export async function generateProjectReport(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o projeto existe e se o usuário tem acesso
    const project = await executeQuery(
      `SELECT user_id FROM Projects WHERE id = @projectId`,
      { projectId }
    );

    if (!project[0]) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    if (role !== 'admin' && project[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    // Verificar se já existe uma análise concluída
    const analysis = await executeQuery(
      `SELECT id, results
       FROM ProjectReports
       WHERE project_id = @projectId
       AND status = 'completed'
       ORDER BY created_at DESC
       LIMIT 1`,
      { projectId }
    );

    if (!analysis[0]) {
      res.status(400).json({ error: 'Nenhuma análise concluída encontrada para este projeto' });
      return;
    }

    // Criar registro do relatório
    const result = await executeQuery(
      `INSERT INTO ProjectReports (project_id, type, status, created_by)
       OUTPUT INSERTED.id
       VALUES (@projectId, 'report', 'processing', @userId)`,
      {
        projectId,
        userId
      }
    );

    const reportId = result[0].id;

    // Gerar relatório em background
    generateReport(projectId, analysis[0].results).catch(error => {
      console.error('Error generating report:', error);
      executeQuery(
        `UPDATE ProjectReports
         SET status = 'error',
             error_message = @error
         WHERE id = @reportId`,
        {
          reportId,
          error: error.message
        }
      );
    });

    res.status(201).json({
      message: 'Geração de relatório iniciada com sucesso',
      report: {
        id: reportId,
        projectId,
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

export async function getReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o relatório existe e se o usuário tem acesso
    const report = await executeQuery(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = @id
       AND r.type = 'report'`,
      { id }
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

export async function downloadReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se o relatório existe e se o usuário tem acesso
    const report = await executeQuery(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = @id
       AND r.type = 'report'`,
      { id }
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
      await fs.access(report[0].file_path);
    } catch (error) {
      res.status(404).json({ error: 'Arquivo do relatório não encontrado no servidor' });
      return;
    }

    res.download(report[0].file_path, report[0].file_name);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Erro ao baixar relatório' });
  }
}

export async function shareReport(req: Request, res: Response): Promise<void> {
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
    const report = await executeQuery(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = @id
       AND r.type = 'report'`,
      { id }
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

    // Verificar se o usuário existe
    const user = await executeQuery(
      `SELECT id FROM Users WHERE email = @email`,
      { email }
    );

    if (!user[0]) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Criar compartilhamento
    await executeQuery(
      `INSERT INTO ReportShares (report_id, user_id, role)
       VALUES (@reportId, @sharedUserId, @role)`,
      {
        reportId: id,
        sharedUserId: user[0].id,
        role
      }
    );

    res.json({ message: 'Relatório compartilhado com sucesso' });
  } catch (error) {
    console.error('Error sharing report:', error);
    res.status(500).json({ error: 'Erro ao compartilhar relatório' });
  }
}

export async function getSharedReports(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const reports = await executeQuery(
      `SELECT r.*, p.name as project_name, u.name as owner_name
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       JOIN Users u ON p.user_id = u.id
       JOIN ReportShares s ON r.id = s.report_id
       WHERE s.user_id = @userId
       AND r.type = 'report'
       AND r.status = 'completed'
       ORDER BY r.created_at DESC`,
      { userId }
    );

    res.json(reports);
  } catch (error) {
    console.error('Error getting shared reports:', error);
    res.status(500).json({ error: 'Erro ao buscar relatórios compartilhados' });
  }
} 