import { Request, Response } from 'express';
import { executeQuery } from '../lib/db';
import { analyzeStructure } from '../services/structuralAnalysisService';

export async function startAnalysis(req: Request, res: Response): Promise<void> {
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

    // Verificar se já existe uma análise em andamento
    const existingAnalysis = await executeQuery(
      `SELECT id FROM ProjectReports
       WHERE project_id = @projectId
       AND status = 'processing'`,
      { projectId }
    );

    if (existingAnalysis[0]) {
      res.status(400).json({ error: 'Já existe uma análise em andamento para este projeto' });
      return;
    }

    // Criar registro da análise
    const result = await executeQuery(
      `INSERT INTO ProjectReports (project_id, status, created_by)
       OUTPUT INSERTED.id
       VALUES (@projectId, 'processing', @userId)`,
      {
        projectId,
        userId
      }
    );

    const analysisId = result[0].id;

    // Iniciar análise em background
    analyzeStructure(projectId).catch(error => {
      console.error('Error analyzing structure:', error);
      executeQuery(
        `UPDATE ProjectReports
         SET status = 'error',
             error_message = @error
         WHERE id = @analysisId`,
        {
          analysisId,
          error: error.message
        }
      );
    });

    res.status(201).json({
      message: 'Análise iniciada com sucesso',
      analysis: {
        id: analysisId,
        projectId,
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    res.status(500).json({ error: 'Erro ao iniciar análise' });
  }
}

export async function getAnalysisStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se a análise existe e se o usuário tem acesso
    const analysis = await executeQuery(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = @id`,
      { id }
    );

    if (!analysis[0]) {
      res.status(404).json({ error: 'Análise não encontrada' });
      return;
    }

    if (role !== 'admin' && analysis[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    res.json({
      status: analysis[0].status,
      errorMessage: analysis[0].error_message,
      progress: analysis[0].progress,
      results: analysis[0].results
    });
  } catch (error) {
    console.error('Error getting analysis status:', error);
    res.status(500).json({ error: 'Erro ao buscar status da análise' });
  }
}

export async function getAnalysisResults(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se a análise existe e se o usuário tem acesso
    const analysis = await executeQuery(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = @id`,
      { id }
    );

    if (!analysis[0]) {
      res.status(404).json({ error: 'Análise não encontrada' });
      return;
    }

    if (role !== 'admin' && analysis[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    if (analysis[0].status !== 'completed') {
      res.status(400).json({ error: 'Análise ainda não concluída' });
      return;
    }

    res.json(analysis[0].results);
  } catch (error) {
    console.error('Error getting analysis results:', error);
    res.status(500).json({ error: 'Erro ao buscar resultados da análise' });
  }
}

export async function cancelAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    // Verificar se a análise existe e se o usuário tem acesso
    const analysis = await executeQuery(
      `SELECT r.*, p.user_id
       FROM ProjectReports r
       JOIN Projects p ON r.project_id = p.id
       WHERE r.id = @id`,
      { id }
    );

    if (!analysis[0]) {
      res.status(404).json({ error: 'Análise não encontrada' });
      return;
    }

    if (role !== 'admin' && analysis[0].user_id !== userId) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    if (analysis[0].status !== 'processing') {
      res.status(400).json({ error: 'Apenas análises em andamento podem ser canceladas' });
      return;
    }

    await executeQuery(
      `UPDATE ProjectReports
       SET status = 'cancelled',
           updated_at = GETDATE()
       WHERE id = @id`,
      { id }
    );

    res.json({ message: 'Análise cancelada com sucesso' });
  } catch (error) {
    console.error('Error canceling analysis:', error);
    res.status(500).json({ error: 'Erro ao cancelar análise' });
  }
} 