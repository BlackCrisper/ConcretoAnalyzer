import { NextResponse } from 'next/server';
import { deleteNotification } from '../../../../services/notificationService';

export async function DELETE(
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

    const success = await deleteNotification(notificationId);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Erro ao excluir notificação' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete notification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao excluir notificação' },
      { status: 500 }
    );
  }
} 