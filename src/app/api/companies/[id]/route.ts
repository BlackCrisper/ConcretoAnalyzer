import { NextRequest, NextResponse } from 'next/server';
import { getCompanyById, updateCompany, deleteCompany } from '@/services/companyService';

// Get company by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const company = await getCompanyById(companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error(`Error getting company ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter empresa' },
      { status: 500 }
    );
  }
}

// Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const body = await request.json();

    // Check if company exists
    const existingCompany = await getCompanyById(companyId);
    if (!existingCompany) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Update company
    const result = await updateCompany(companyId, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao atualizar empresa' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    console.error(`Error updating company ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar empresa' },
      { status: 500 }
    );
  }
}

// Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Check if company exists
    const existingCompany = await getCompanyById(companyId);
    if (!existingCompany) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Delete company (or deactivate)
    const result = await deleteCompany(companyId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao excluir empresa' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Empresa excluída com sucesso'
    });
  } catch (error) {
    console.error(`Error deleting company ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao excluir empresa' },
      { status: 500 }
    );
  }
}
