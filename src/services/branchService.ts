"use server";

import { executeQuery } from '@/lib/db';
import { BranchOffice } from '@/contexts/auth-context';

interface DBBranch {
  id: string;
  name: string;
  company_id: string;
}

interface CountResult {
  count: number;
}

interface IdResult {
  id: string;
}

// Get all branches or branches of a specific company
export async function getAllBranches(companyId?: string): Promise<BranchOffice[]> {
  try {
    let query = `
      SELECT id, name, company_id
      FROM Branches
    `;

    const params: Record<string, any> = {};

    if (companyId) {
      query += ` WHERE company_id = @companyId`;
      params.companyId = companyId;
    }

    query += ` ORDER BY name`;

    const branches = await executeQuery<DBBranch>(query, params);

    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      companyId: branch.company_id
    }));
  } catch (error) {
    console.error('Error getting branches:', error);
    return [];
  }
}

// Get branch by ID
export async function getBranchById(branchId: string): Promise<BranchOffice | null> {
  try {
    const branches = await executeQuery<DBBranch>(`
      SELECT id, name, company_id
      FROM Branches
      WHERE id = @branchId
    `, { branchId });

    if (branches.length === 0) {
      return null;
    }

    const branch = branches[0];

    return {
      id: branch.id,
      name: branch.name,
      companyId: branch.company_id
    };
  } catch (error) {
    console.error(`Error getting branch ${branchId}:`, error);
    return null;
  }
}

// Create a new branch
export async function createBranch(branchData: Omit<BranchOffice, 'id'>): Promise<{ success: boolean, branchId?: string, message?: string }> {
  try {
    // Check if company exists
    const companyExists = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Companies WHERE id = @companyId
    `, { companyId: branchData.companyId });

    if (companyExists[0]?.count === 0) {
      return { success: false, message: 'Empresa não encontrada' };
    }

    const result = await executeQuery<IdResult>(`
      INSERT INTO Branches (name, company_id)
      VALUES (@name, @companyId);
      SELECT SCOPE_IDENTITY() AS id;
    `, {
      name: branchData.name,
      companyId: branchData.companyId
    });

    const branchId = result[0]?.id;

    return { success: true, branchId };
  } catch (error) {
    console.error('Error creating branch:', error);
    return { success: false, message: 'Erro ao criar filial' };
  }
}

// Update branch
export async function updateBranch(branchId: string, branchData: Partial<Omit<BranchOffice, 'id'>>): Promise<{ success: boolean, message?: string }> {
  try {
    // Check if branch exists
    const branchExists = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Branches WHERE id = @branchId
    `, { branchId });

    if (branchExists[0]?.count === 0) {
      return { success: false, message: 'Filial não encontrada' };
    }

    // Check if company exists if companyId is provided
    if (branchData.companyId) {
      const companyExists = await executeQuery<CountResult>(`
        SELECT COUNT(*) as count FROM Companies WHERE id = @companyId
      `, { companyId: branchData.companyId });

      if (companyExists[0]?.count === 0) {
        return { success: false, message: 'Empresa não encontrada' };
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: Record<string, any> = { branchId };

    if (branchData.name) {
      updates.push('name = @name');
      params.name = branchData.name;
    }

    if (branchData.companyId) {
      updates.push('company_id = @companyId');
      params.companyId = branchData.companyId;
    }

    if (updates.length === 0) {
      return { success: false, message: 'Nenhum dado para atualizar' };
    }

    await executeQuery(`
      UPDATE Branches
      SET ${updates.join(', ')}
      WHERE id = @branchId
    `, params);

    return { success: true };
  } catch (error) {
    console.error('Error updating branch:', error);
    return { success: false, message: 'Erro ao atualizar filial' };
  }
}

// Delete branch
export async function deleteBranch(branchId: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Check if branch exists
    const branchExists = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Branches WHERE id = @branchId
    `, { branchId });

    if (branchExists[0]?.count === 0) {
      return { success: false, message: 'Filial não encontrada' };
    }

    // Check if branch has users
    const usersCount = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Users WHERE branch_id = @branchId
    `, { branchId });

    if (usersCount[0]?.count > 0) {
      return { success: false, message: 'Não é possível excluir uma filial que possui usuários' };
    }

    await executeQuery(`
      DELETE FROM Branches
      WHERE id = @branchId
    `, { branchId });

    return { success: true };
  } catch (error) {
    console.error('Error deleting branch:', error);
    return { success: false, message: 'Erro ao excluir filial' };
  }
}
