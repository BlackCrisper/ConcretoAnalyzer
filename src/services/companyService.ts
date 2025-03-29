'use server';

import { executeQuery } from '@/lib/db';
import { Company, BranchOffice } from '@/contexts/auth-context';

interface DBCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

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

// Get all companies
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const companies = await executeQuery<DBCompany>(`
      SELECT id, name, email, phone, address, active
      FROM Companies
      WHERE active = 1
      ORDER BY name
    `);

    // Convert to Company objects with branches
    const result: Company[] = [];

    for (const company of companies) {
      result.push({
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        active: company.active,
        branches: await getCompanyBranches(company.id),
      });
    }

    return result;
  } catch (error) {
    console.error('Error getting companies:', error);
    return [];
  }
}

// Get all branches for a company
export async function getCompanyBranches(companyId: string): Promise<BranchOffice[]> {
  try {
    const branches = await executeQuery<DBBranch>(
      `
      SELECT id, name, company_id
      FROM Branches
      WHERE company_id = @companyId
      ORDER BY name
    `,
      { companyId }
    );

    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      companyId: branch.company_id,
    }));
  } catch (error) {
    console.error(`Error getting branches for company ${companyId}:`, error);
    return [];
  }
}

// Create a new company
export async function createCompany(
  companyData: Omit<Company, 'id' | 'branches'>
): Promise<{ success: boolean; companyId?: string; message?: string }> {
  try {
    const result = await executeQuery<IdResult>(
      `
      INSERT INTO Companies (name, email, phone, address, active)
      VALUES (@name, @email, @phone, @address, @active);
      SELECT SCOPE_IDENTITY() AS id;
    `,
      {
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        active: companyData.active,
      }
    );

    const companyId = result[0]?.id;

    return { success: true, companyId };
  } catch (error) {
    console.error('Error creating company:', error);
    return { success: false, message: 'Erro ao criar empresa' };
  }
}

// Update a company
export async function updateCompany(
  companyId: string,
  companyData: Partial<Omit<Company, 'id' | 'branches'>>
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if company exists
    const companyExists = await executeQuery<CountResult>(
      `
      SELECT COUNT(*) as count FROM Companies WHERE id = @companyId
    `,
      { companyId }
    );

    if (companyExists[0]?.count === 0) {
      return { success: false, message: 'Empresa não encontrada' };
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: Record<string, any> = { companyId };

    if (companyData.name) {
      updates.push('name = @name');
      params.name = companyData.name;
    }

    if (companyData.email) {
      updates.push('email = @email');
      params.email = companyData.email;
    }

    if (companyData.phone) {
      updates.push('phone = @phone');
      params.phone = companyData.phone;
    }

    if (companyData.address) {
      updates.push('address = @address');
      params.address = companyData.address;
    }

    if (typeof companyData.active === 'boolean') {
      updates.push('active = @active');
      params.active = companyData.active;
    }

    if (updates.length === 0) {
      return { success: false, message: 'Nenhum dado para atualizar' };
    }

    await executeQuery(
      `
      UPDATE Companies
      SET ${updates.join(', ')}
      WHERE id = @companyId
    `,
      params
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating company:', error);
    return { success: false, message: 'Erro ao atualizar empresa' };
  }
}

// Create a new branch
export async function createBranch(
  branchData: Omit<BranchOffice, 'id'>
): Promise<{ success: boolean; branchId?: string; message?: string }> {
  try {
    const result = await executeQuery<IdResult>(
      `
      INSERT INTO Branches (name, company_id)
      VALUES (@name, @companyId);
      SELECT SCOPE_IDENTITY() AS id;
    `,
      {
        name: branchData.name,
        companyId: branchData.companyId,
      }
    );

    const branchId = result[0]?.id;

    return { success: true, branchId };
  } catch (error) {
    console.error('Error creating branch:', error);
    return { success: false, message: 'Erro ao criar filial' };
  }
}

// Update a branch
export async function updateBranch(
  branchId: string,
  branchData: Partial<Omit<BranchOffice, 'id'>>
): Promise<{ success: boolean; message?: string }> {
  try {
    let query = 'UPDATE Branches SET ';
    const params: Record<string, any> = { branchId };
    const updates: string[] = [];

    if (branchData.name) {
      updates.push('name = @name');
      params.name = branchData.name;
    }

    if (branchData.companyId) {
      updates.push('company_id = @companyId');
      params.companyId = branchData.companyId;
    }

    if (updates.length === 0) {
      return { success: true };
    }

    query += updates.join(', ') + ' WHERE id = @branchId';

    await executeQuery(query, params);

    return { success: true };
  } catch (error) {
    console.error('Error updating branch:', error);
    return { success: false, message: 'Erro ao atualizar filial' };
  }
}

// Delete a branch
export async function deleteBranch(
  branchId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // First check if there are users associated with this branch
    const usersCount = await executeQuery<CountResult>(
      `
      SELECT COUNT(*) as count FROM Users WHERE branch_id = @branchId
    `,
      { branchId }
    );

    if (usersCount[0]?.count > 0) {
      return {
        success: false,
        message: 'Não é possível excluir esta filial pois existem usuários associados a ela.',
      };
    }

    // Delete the branch
    await executeQuery('DELETE FROM Branches WHERE id = @branchId', { branchId });

    return { success: true };
  } catch (error) {
    console.error('Error deleting branch:', error);
    return { success: false, message: 'Erro ao excluir filial' };
  }
}

// Get company by ID
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const companies = await executeQuery<DBCompany>(
      `
      SELECT id, name, email, phone, address, active
      FROM Companies
      WHERE id = @companyId
    `,
      { companyId }
    );

    if (companies.length === 0) {
      return null;
    }

    const company = companies[0];

    return {
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      active: company.active,
      branches: await getCompanyBranches(company.id),
    };
  } catch (error) {
    console.error(`Error getting company ${companyId}:`, error);
    return null;
  }
}

// Delete company
export async function deleteCompany(
  companyId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check if company exists
    const companyExists = await executeQuery<CountResult>(
      `
      SELECT COUNT(*) as count FROM Companies WHERE id = @companyId
    `,
      { companyId }
    );

    if (companyExists[0]?.count === 0) {
      return { success: false, message: 'Empresa não encontrada' };
    }

    // Check if company has users
    const usersCount = await executeQuery<CountResult>(
      `
      SELECT COUNT(*) as count FROM Users WHERE company_id = @companyId
    `,
      { companyId }
    );

    if (usersCount[0]?.count > 0) {
      return { success: false, message: 'Não é possível excluir uma empresa que possui usuários' };
    }

    // Check if company has branches
    const branchesCount = await executeQuery<CountResult>(
      `
      SELECT COUNT(*) as count FROM Branches WHERE company_id = @companyId
    `,
      { companyId }
    );

    if (branchesCount[0]?.count > 0) {
      return { success: false, message: 'Não é possível excluir uma empresa que possui filiais' };
    }

    await executeQuery(
      `
      DELETE FROM Companies
      WHERE id = @companyId
    `,
      { companyId }
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting company:', error);
    return { success: false, message: 'Erro ao excluir empresa' };
  }
}
