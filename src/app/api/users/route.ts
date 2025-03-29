import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/services/userService';

// Get all users
export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers();

    return NextResponse.json({
      success: true,
      users: users.map(({ id, name, email, role, company, companyId, branchId, branchName }) => ({
        id,
        name,
        email,
        role,
        company,
        companyId,
        branchId,
        branchName,
      })),
    });
  } catch (error) {
    console.error('Error getting users:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter usuários' },
      { status: 500 }
    );
  }
}

// Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, companyId, branchId, permissions } = body;

    // Validate required fields
    if (!name || !email || !password || !role || !companyId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Campos obrigatórios não fornecidos',
        },
        { status: 400 }
      );
    }

    // Create user in the database
    const result = await createUser({
      name,
      email,
      password,
      role,
      companyId,
      branchId,
      permissions: permissions || [],
      company: '', // This will be set by the database based on companyId
      branchName: null,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao criar usuário' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      userId: result.userId,
    });
  } catch (error) {
    console.error('Error creating user:', error);

    return NextResponse.json({ success: false, message: 'Erro ao criar usuário' }, { status: 500 });
  }
}
