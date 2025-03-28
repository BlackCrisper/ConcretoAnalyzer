import { NextRequest, NextResponse } from 'next/server';
import { getAllInvitations, createInvitation } from '@/services/invitationService';

// Get all invitations
export async function GET(request: NextRequest) {
  try {
    const invitations = await getAllInvitations();

    return NextResponse.json({
      success: true,
      invitations
    });
  } catch (error) {
    console.error('Error getting invitations:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao obter convites' },
      { status: 500 }
    );
  }
}

// Create a new invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, branchId, permissions, expirationDays = 7 } = body;

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email e role são obrigatórios'
        },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expirationDays);
    const expiresAt = expiryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Create invitation in the database
    try {
      const invitation = await createInvitation({
        email,
        role,
        branchId,
        permissions: permissions || [],
        expiresAt
      });

      // Return the created invitation
      return NextResponse.json({
        success: true,
        message: 'Convite criado com sucesso',
        invitation
      });
    } catch (invitationError) {
      console.error('Error creating invitation:', invitationError);

      return NextResponse.json(
        { success: false, message: 'Erro ao criar convite' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating invitation:', error);

    return NextResponse.json(
      { success: false, message: 'Erro ao criar convite' },
      { status: 500 }
    );
  }
}
