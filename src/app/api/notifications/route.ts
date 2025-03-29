import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/services/notificationService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const notifications = await getUserNotifications(userId);

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}
