import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, updateUserLastLogin } from '@/services/userService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authenticateUser(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message || 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Return user data (except sensitive information)
    if (authResult.user) {
      const { id, name, email, role, company, companyId, branchId, branchName, permissions } =
        authResult.user;

      // Update last login timestamp in the database
      await updateUserLastLogin(id);

      return NextResponse.json({
        success: true,
        user: {
          id,
          name,
          email,
          role,
          company,
          companyId,
          branchId,
          branchName,
          permissions,
        },
      });
    }

    // This should not happen if authenticateUser is implemented correctly
    return NextResponse.json(
      { success: false, message: 'Erro inesperado durante autenticação' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Login API error:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao processar solicitação de login' },
      { status: 500 }
    );
  }
}
