import { NextRequest, NextResponse } from 'next/server';
import { getAllBranches, createBranch } from '@/services/branchService';

// Get all branches (or branches of a specific company if companyId is provided)
export async function GET(request: NextRequest) {
  try {
    // Check if companyId is provided as a query parameter
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const branches = await getAllBranches(companyId || undefined);

    return NextResponse.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error getting branches:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter filiais' },
      { status: 500 }
    );
  }
}

// Create a new branch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, companyId } = body;

    // Validate required fields
    if (!name || !companyId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome da filial e ID da empresa são obrigatórios'
        },
        { status: 400 }
      );
    }

    // Create branch in the database
    const result = await createBranch({
      name,
      companyId
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao criar filial' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Filial criada com sucesso',
      branchId: result.branchId
    });
  } catch (error) {
    console.error('Error creating branch:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao criar filial' },
      { status: 500 }
    );
  }
}
