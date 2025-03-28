import { NextRequest, NextResponse } from 'next/server';
import { getInvitationById, revokeInvitation, resendInvitation } from '@/services/invitationService';

// Get invitation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id;
    const invitation = await getInvitationById(invitationId);

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation
    });
  } catch (error) {
    console.error(`Error getting invitation ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter convite' },
      { status: 500 }
    );
  }
}

// Revoke invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id;

    // Check if invitation exists
    const existingInvitation = await getInvitationById(invitationId);
    if (!existingInvitation) {
      return NextResponse.json(
        { success: false, message: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Revoke invitation
    const result = await revokeInvitation(invitationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao revogar convite' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Convite revogado com sucesso'
    });
  } catch (error) {
    console.error(`Error revoking invitation ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao revogar convite' },
      { status: 500 }
    );
  }
}
