import { NextRequest, NextResponse } from 'next/server';
import { getAllCompanies, createCompany } from '@/services/companyService';

// Get all companies
export async function GET(request: NextRequest) {
  try {
    const companies = await getAllCompanies();

    return NextResponse.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Error getting companies:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter empresas' },
      { status: 500 }
    );
  }
}

// Create a new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, active = true } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome da empresa é obrigatório'
        },
        { status: 400 }
      );
    }

    // Create company in the database
    const result = await createCompany({
      name,
      email: email || '',
      phone: phone || '',
      address: address || '',
      active
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao criar empresa' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Empresa criada com sucesso',
      companyId: result.companyId
    });
  } catch (error) {
    console.error('Error creating company:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao criar empresa' },
      { status: 500 }
    );
  }
}
