import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/services/notificationService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'ID da notificação é obrigatório' },
        { status: 400 }
      );
    }

    const success = await markNotificationAsRead(notificationId);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Erro ao marcar notificação como lida' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mark notification as read API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao marcar notificação como lida' },
      { status: 500 }
    );
  }
} 