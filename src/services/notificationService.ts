import { executeQuery } from '@/lib/db';
import { logger } from '../lib/logger';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

interface IdResult {
  id: string;
}

interface CountResult {
  count: number;
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info'
): Promise<Notification | null> {
  try {
    const result = await executeQuery<IdResult>(
      `INSERT INTO Notifications (user_id, title, message, type, read, created_at)
       VALUES (@userId, @title, @message, @type, 0, GETDATE());
       SELECT SCOPE_IDENTITY() as id;`,
      { userId, title, message, type }
    );

    if (result[0]?.id) {
      return {
        id: result[0].id,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date()
      };
    }

    return null;
  } catch (error) {
    logger.error('Error creating notification:', error);
    return null;
  }
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    return await executeQuery<Notification>(
      `SELECT id, user_id as userId, title, message, type, read, created_at as createdAt
       FROM Notifications
       WHERE user_id = @userId
       ORDER BY created_at DESC`,
      { userId }
    );
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const result = await executeQuery<CountResult>(
      `UPDATE Notifications 
       SET read = 1 
       WHERE id = @id;
       SELECT @@ROWCOUNT as count;`,
      { id: notificationId }
    );

    return result[0]?.count > 0;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return false;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const result = await executeQuery<CountResult>(
      `DELETE FROM Notifications 
       WHERE id = @id;
       SELECT @@ROWCOUNT as count;`,
      { id: notificationId }
    );

    return result[0]?.count > 0;
  } catch (error) {
    logger.error('Error deleting notification:', error);
    return false;
  }
} 