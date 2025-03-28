import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/services/userService';

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Don't send password hash back to the client
    const { id, name, email, role, company, companyId, branchId, branchName, permissions } = user;

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
        permissions
      }
    });
  } catch (error) {
    console.error(`Error getting user ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter usuário' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();

    // Check if user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Update user
    const result = await updateUser(userId, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao atualizar usuário' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Check if user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Delete user (or deactivate, depending on your preference)
    const result = await deleteUser(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao excluir usuário' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}
