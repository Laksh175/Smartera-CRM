import type { Response, NextFunction } from 'express';
import { NotificationsService } from '../services/notifications.service.js';
import type { AuthRequest } from '../middlewares/auth.js';

export class NotificationsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifs = NotificationsService.getNotifications(req.user?.id);
      return res.status(200).json({ success: true, data: notifs });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = NotificationsService.markAsRead(req.params.id);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = NotificationsService.markAllAsRead(req.user?.id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
