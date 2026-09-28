import { db } from '../db/connection.js';

export class NotificationsService {
  static getNotifications(userId?: string) {
    if (!userId) return db.notifications;
    return db.notifications.filter((n) => n.user_id === userId || n.user_id === '11111111-1111-1111-1111-111111111111');
  }

  static markAsRead(id: string) {
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
    }
    return notif;
  }

  static markAllAsRead(userId?: string) {
    db.notifications.forEach((n) => {
      if (!userId || n.user_id === userId || n.user_id === '11111111-1111-1111-1111-111111111111') {
        n.is_read = true;
      }
    });
    return { success: true };
  }
}
