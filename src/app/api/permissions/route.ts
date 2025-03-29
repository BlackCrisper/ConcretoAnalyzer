import { NextRequest, NextResponse } from 'next/server';
import { getAllPermissions } from '@/services/permissionService';

// Get all permissions
export async function GET(request: NextRequest) {
  try {
    const permissions = await getAllPermissions();

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error('Error getting permissions:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter permissões' },
      { status: 500 }
    );
  }
}
