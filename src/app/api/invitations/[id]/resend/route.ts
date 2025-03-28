import { NextRequest, NextResponse } from 'next/server';
import { getInvitationById, resendInvitation } from '@/services/invitationService';

// Resend invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id;
    const body = await request.json();
    const { expirationDays = 7 } = body;

    // Check if invitation exists
    const existingInvitation = await getInvitationById(invitationId);
    if (!existingInvitation) {
      return NextResponse.json(
        { success: false, message: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Resend invitation
    const result = await resendInvitation(invitationId, expirationDays);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Erro ao reenviar convite' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Convite reenviado com sucesso',
      token: result.token
    });
  } catch (error) {
    console.error(`Error resending invitation ${params.id}:`, error);

    return NextResponse.json(
      { success: false, message: 'Erro ao reenviar convite' },
      { status: 500 }
    );
  }
}
