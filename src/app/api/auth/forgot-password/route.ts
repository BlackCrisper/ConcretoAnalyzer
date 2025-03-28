import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const users = await executeQuery<{ id: string }>(
      'SELECT id FROM Users WHERE email = @email AND active = 1',
      { email }
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email não encontrado' },
        { status: 404 }
      );
    }

    // Gerar token de recuperação
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token válido por 1 hora

    // Salvar token no banco
    await executeQuery(
      `INSERT INTO PasswordResets (user_id, token, expires_at)
       VALUES (@userId, @token, @expiresAt)`,
      {
        userId: users[0].id,
        token: resetToken,
        expiresAt: tokenExpiry
      }
    );

    // Enviar email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Erro ao enviar email de recuperação' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de recuperação enviado com sucesso'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
} 