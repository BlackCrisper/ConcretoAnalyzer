import { NextRequest, NextResponse } from 'next/server';
import { getBranchById, updateBranch, deleteBranch } from '@/services/branchService';

// Get branch by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const branchId = params.id;
    const branch = await getBranchById(branchId);

    if (!branch) {
      return NextResponse.json(
        { success: false, message: 'Filial não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      branch,
    });
  } catch (error) {
    console.error(`Error getting branch ${params.id}:`, error);

    return NextResponse.json({ success: false, message: 'Erro ao obter filial' }, { status: 500 });
  }
}

// Update branch
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const branchId = params.id;
    const body = await request.json();

    // Check if branch exists
    const existingBranch = await getBranchById(branchId);
    if (!existingBranch) {
      return NextResponse.json(
        { success: false, message: 'Filial não encontrada' },
        { status: 404 }
      );
    }

    // Update branch
    const result = await updateBranch(branchId, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao atualizar filial' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Filial atualizada com sucesso',
    });
  } catch (error) {
    console.error(`Error updating branch ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar filial' },
      { status: 500 }
    );
  }
}

// Delete branch
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const branchId = params.id;

    // Check if branch exists
    const existingBranch = await getBranchById(branchId);
    if (!existingBranch) {
      return NextResponse.json(
        { success: false, message: 'Filial não encontrada' },
        { status: 404 }
      );
    }

    // Delete branch
    const result = await deleteBranch(branchId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao excluir filial' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Filial excluída com sucesso',
    });
  } catch (error) {
    console.error(`Error deleting branch ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao excluir filial' },
      { status: 500 }
    );
  }
}
